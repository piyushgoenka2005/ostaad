"use client";

import { useState, useEffect, useCallback } from "react";
import { IProduct } from "@/types";
import { DEFAULT_CATALOG } from "@/lib/constants/defaultCatalog";
import { subscribeToProducts, saveProductToFirestore, deleteProductFromFirestore } from "@/lib/firebase/firestore";

export function useProducts() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const getDeletedIds = useCallback((): Set<string> => {
    try {
      return new Set(JSON.parse(localStorage.getItem("ostaad_deleted_product_ids") || "[]"));
    } catch {
      return new Set();
    }
  }, []);

  const loadFromLocal = useCallback(() => {
    const deletedIds = getDeletedIds();
    const saved = localStorage.getItem("ostaad_product_catalog");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (p: IProduct) => !p.isDeleted && p.status !== "deleted" && !deletedIds.has(p.id)
          );
          const normalized = filtered.map((p: IProduct) => {
            const def = DEFAULT_CATALOG.find((d) => d.id === p.id);
            if (def && p.image?.includes("unsplash.com")) {
              return { ...p, image: def.image };
            }
            return p;
          });
          setProducts(normalized);
          return;
        }
      } catch (e) {}
    }
    setProducts(DEFAULT_CATALOG.filter((p) => !deletedIds.has(p.id)));
  }, [getDeletedIds]);

  useEffect(() => {
    loadFromLocal();
    setLoading(false);

    // Subscribe to Firestore Real-time updates
    const unsubscribe = subscribeToProducts((firestoreProducts) => {
      if (firestoreProducts && Array.isArray(firestoreProducts)) {
        const deletedIds = getDeletedIds();
        const active = firestoreProducts.filter(
          (p) => !p.isDeleted && p.status !== "deleted" && !deletedIds.has(p.id)
        );
        if (active.length > 0) {
          const normalized = active.map((p) => {
            const def = DEFAULT_CATALOG.find((d) => d.id === p.id);
            if (def && (!p.image || p.image.includes("unsplash.com"))) {
              return { ...p, image: def.image };
            }
            return p;
          });
          setProducts(normalized);
          localStorage.setItem("ostaad_product_catalog", JSON.stringify(normalized));
        } else if (firestoreProducts.length === 0 && deletedIds.size === 0) {
          // Auto-seed default catalog
          DEFAULT_CATALOG.forEach((item) => saveProductToFirestore(item));
        }
      }
    });

    // Cross-tab storage sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "ostaad_product_catalog" || e.key === "ostaad_deleted_product_ids") {
        loadFromLocal();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, [getDeletedIds, loadFromLocal]);

  const addOrUpdateProduct = async (product: IProduct) => {
    const deletedIds = getDeletedIds();
    deletedIds.delete(product.id);
    localStorage.setItem("ostaad_deleted_product_ids", JSON.stringify(Array.from(deletedIds)));

    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      let updated;
      if (idx !== -1) {
        updated = [...prev];
        updated[idx] = product;
      } else {
        updated = [product, ...prev];
      }
      localStorage.setItem("ostaad_product_catalog", JSON.stringify(updated));
      return updated;
    });

    await saveProductToFirestore(product);
  };

  const removeProduct = async (productId: string) => {
    const deletedIds = getDeletedIds();
    deletedIds.add(productId);
    localStorage.setItem("ostaad_deleted_product_ids", JSON.stringify(Array.from(deletedIds)));

    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      localStorage.setItem("ostaad_product_catalog", JSON.stringify(updated));
      return updated;
    });

    await deleteProductFromFirestore(productId);
  };

  const resetToDefaults = async () => {
    localStorage.removeItem("ostaad_deleted_product_ids");
    localStorage.setItem("ostaad_product_catalog", JSON.stringify(DEFAULT_CATALOG));
    setProducts(DEFAULT_CATALOG);

    for (const item of DEFAULT_CATALOG) {
      await saveProductToFirestore(item);
    }
  };

  return {
    products,
    loading,
    addOrUpdateProduct,
    removeProduct,
    resetToDefaults,
  };
}

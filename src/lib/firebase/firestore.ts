import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./client";
import { IProduct, BOQRequestPayload } from "@/types";

/**
 * Real-time listener for Firestore verified products
 */
export function subscribeToProducts(onData: (products: IProduct[]) => void) {
  try {
    const prodCol = collection(db, "products");
    return onSnapshot(
      prodCol,
      (snapshot) => {
        const prods: IProduct[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<IProduct>;
          if (!data.isDeleted && data.status !== "deleted") {
            prods.push({ id: docSnap.id, ...data } as IProduct);
          }
        });
        onData(prods);
      },
      (error) => {
        console.warn("Firestore product snapshot error:", error);
      }
    );
  } catch (err) {
    console.warn("Failed to subscribe to Firestore products:", err);
    return () => {};
  }
}

/**
 * Fetch all verified products once
 */
export async function fetchProductsFromFirestore(): Promise<IProduct[]> {
  try {
    const snap = await getDocs(collection(db, "products"));
    const prods: IProduct[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Partial<IProduct>;
      if (!data.isDeleted && data.status !== "deleted") {
        prods.push({ id: docSnap.id, ...data } as IProduct);
      }
    });
    return prods;
  } catch (err) {
    console.warn("Failed to fetch products from Firestore:", err);
    return [];
  }
}

/**
 * Save product to Firestore (Upsert)
 */
export async function saveProductToFirestore(product: IProduct) {
  try {
    const docId = product.id || `prod_${Date.now()}`;
    const prodRef = doc(db, "products", docId);
    const dataToSave: IProduct = {
      ...product,
      id: docId,
      isDeleted: false,
      lastUpdated: Date.now(),
    };
    await setDoc(prodRef, dataToSave, { merge: true });
    return { success: true, id: docId };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Firestore product save error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete product from Firestore (Hard + Soft delete)
 */
export async function deleteProductFromFirestore(productId: string) {
  try {
    const prodRef = doc(db, "products", productId);
    try {
      await setDoc(
        prodRef,
        { isDeleted: true, status: "deleted", deletedAt: Date.now() },
        { merge: true }
      );
    } catch (e) {
      console.warn("Soft delete flag warning:", e);
    }
    await deleteDoc(prodRef);
    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Firestore product delete error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Save BOQ request into Firestore
 */
export async function saveUserBOQ(boqData: BOQRequestPayload) {
  try {
    const currentUser = auth.currentUser;
    const timestamp = serverTimestamp();
    const payload = {
      ...boqData,
      status: "Pending Engineering Audit",
      createdAt: timestamp,
      userId: currentUser ? currentUser.uid : "anonymous",
      userEmail: currentUser ? currentUser.email : boqData.email || "anonymous",
    };

    const globalRef = await addDoc(collection(db, "boq_requests"), payload);

    if (currentUser) {
      await setDoc(
        doc(db, "users", currentUser.uid, "boq_requests", globalRef.id),
        {
          ...payload,
          requestId: globalRef.id,
        }
      );
    }

    return { success: true, id: globalRef.id };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Firestore BOQ save error:", err);
    return { success: false, error: err.message };
  }
}

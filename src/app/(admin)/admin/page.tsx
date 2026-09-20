"use client";

import { useState, useEffect, useMemo, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Download,
  Upload,
  Plus,
  Search,
  RotateCcw,
  Pencil,
  Copy,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { IProduct } from "@/types";
import { useProducts } from "@/hooks/useProducts";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { KpiCards } from "@/components/admin/KpiCards";
import { ProductFormModal } from "@/components/admin/ProductFormModal";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { products, addOrUpdateProduct, removeProduct, resetToDefaults } =
    useProducts();

  const [authChecked, setAuthChecked] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@ostaad.in");
  const [adminRole, setAdminRole] = useState("Super Admin");

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title_asc");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<IProduct | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, 3200);
  };

  useEffect(() => {
    try {
      const sessionStr =
        sessionStorage.getItem("ostaad_admin_session") ||
        localStorage.getItem("ostaad_admin_session");
      if (!sessionStr) {
        router.push("/admin-login");
        return;
      }
      const sess = JSON.parse(sessionStr);
      if (!sess || !sess.authenticated) {
        router.push("/admin-login");
        return;
      }
      if (sess.email) setAdminEmail(sess.email);
      if (sess.role) setAdminRole(sess.role);
      setAuthChecked(true);
    } catch {
      router.push("/admin-login");
    }
  }, [router]);

  // Filtered & Sorted Products
  const displayedProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        return (
          p.title?.toLowerCase().includes(q) ||
          p.grade?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.standard?.toLowerCase().includes(q) ||
          p.shipper?.toLowerCase().includes(q)
        );
      });
    }

    // Category Filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Status Filter
    if (statusFilter !== "all") {
      result = result.filter((p) => (p.status || "in_stock") === statusFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "title_asc") return a.title.localeCompare(b.title);
      if (sortBy === "price_asc") return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === "price_desc") return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === "date_desc") {
        return (b.lastUpdated || 0) - (a.lastUpdated || 0);
      }
      return 0;
    });

    return result;
  }, [products, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Handle Add/Edit
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: IProduct) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = async (product: IProduct) => {
    await addOrUpdateProduct(product);
    showToast(
      editingProduct
        ? `Updated specification for "${product.title}"`
        : `Added new product "${product.title}"`
    );
  };

  // Handle Clone
  const handleCloneProduct = async (product: IProduct) => {
    const cloneId = "prod_" + Date.now();
    const clonedProduct: IProduct = {
      ...product,
      id: cloneId,
      title: `${product.title} (Copy)`,
      lastUpdated: Date.now(),
      isDeleted: false,
    };
    await addOrUpdateProduct(clonedProduct);
    showToast(`Cloned "${clonedProduct.title}"`);
  };

  // Handle Delete
  const handleOpenDeleteModal = (product: IProduct) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    const title = deletingProduct.title;
    await removeProduct(deletingProduct.id);
    setIsDeleteModalOpen(false);
    setDeletingProduct(null);
    showToast(`Deleted "${title}"`);
  };

  // Handle Export JSON
  const handleExportJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `ostaad_products_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Exported catalog JSON backup");
  };

  // Handle Import JSON
  const handleTriggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        if (Array.isArray(imported)) {
          for (const item of imported) {
            if (item && item.id && item.title) {
              await addOrUpdateProduct(item);
            }
          }
          showToast(`Successfully imported ${imported.length} products`);
        } else {
          alert("Invalid JSON format. Expected an array of products.");
        }
      } catch {
        alert("Error parsing JSON file. Please check file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle Reset Catalog
  const handleResetCatalog = async () => {
    if (
      window.confirm(
        "Reset catalog back to Ostaad default verified specifications in database?"
      )
    ) {
      await resetToDefaults();
      showToast("Catalog reset to standard verified defaults");
    }
  };

  const getCategoryClass = (category: string) => {
    const cat = category?.toLowerCase() || "";
    if (cat.includes("cement")) return "bg-[rgba(168,117,69,0.12)] text-[#A87545]";
    if (cat.includes("paint")) return "bg-[rgba(124,135,100,0.15)] text-[#586343]";
    if (cat.includes("plywood")) return "bg-[rgba(184,161,139,0.2)] text-[#785A3F]";
    if (cat.includes("tile")) return "bg-[rgba(36,68,100,0.12)] text-[#244464]";
    if (cat.includes("waterproof")) return "bg-[rgba(14,116,144,0.12)] text-[#0E7490]";
    return "bg-[#23384F]/10 text-[#23384F]";
  };

  const getStatusBadge = (status: string) => {
    if (status === "low_stock") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#92400E]"></span>
          Low Inventory
        </span>
      );
    }
    if (status === "backorder") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-medium bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B]"></span>
          Backorder / On Demand
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[11px] font-medium bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#065F46]"></span>
        In Stock
      </span>
    );
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] flex items-center justify-center">
        <div className="text-sm font-mono text-[#54524D] animate-pulse">
          Verifying administrative privileges...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] text-[#54524D] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AdminSidebar
        productCount={products.length}
        adminEmail={adminEmail}
        adminRole={adminRole}
      />

      {/* Main Content Area */}
      <main className="lg:ml-[260px] flex-1 p-5 sm:p-8 lg:p-10 max-w-[1540px] w-full lg:w-[calc(100%-260px)] pt-20 lg:pt-10">
        {/* Top Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-2xl sm:text-[26px] font-semibold text-[#23384F] tracking-tight leading-tight">
              Material & Product Catalog
            </h1>
            <p className="text-xs sm:text-[13px] text-[#B8A18B] font-mono mt-0.5">
              Verified Procurement Specifications · Direct Mill Benchmarks
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleExportJson}
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "rgba(184, 161, 139, 0.42)",
                color: "#23384F",
              }}
              className="bg-white border border-[rgba(184,161,139,0.42)] text-[#23384F] hover:bg-[#FAF7F4] px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handleTriggerImport}
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "rgba(184, 161, 139, 0.42)",
                color: "#23384F",
              }}
              className="bg-white border border-[rgba(184,161,139,0.42)] text-[#23384F] hover:bg-[#FAF7F4] px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".json"
                className="hidden"
              />
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              style={{
                backgroundColor: "#23384F",
                color: "#FFFFFF",
                boxShadow: "0 4px 14px rgba(35, 56, 79, 0.28)",
              }}
              className="!bg-[#23384F] hover:!bg-[#31465F] !text-white px-4 py-2.5 rounded-xl text-xs sm:text-[13.5px] font-semibold flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg"
            >
              <Plus className="w-4 h-4 !text-white" strokeWidth={2.5} />
              <span className="!text-white font-semibold">Add New Product</span>
            </button>
          </div>
        </header>

        {/* KPI Summary Cards */}
        <KpiCards products={products} />

        {/* Controls Bar */}
        <div className="bg-white border border-[rgba(184,161,139,0.42)] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5 bg-[#FAF7F4] border border-[rgba(184,161,139,0.42)] rounded-xl px-3.5 py-2 flex-1 max-w-full md:max-w-[420px]">
            <Search className="w-4 h-4 text-[#B8A18B] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, standard, grade, or mill..."
              className="w-full bg-transparent border-none text-[13.5px] text-[#23384F] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#FAF7F4] border border-[rgba(184,161,139,0.42)] rounded-xl px-3 py-2 text-[13px] text-[#23384F] focus:outline-none focus:border-[#23384F] cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="Cement">Cement</option>
              <option value="Paint">Paint & Coatings</option>
              <option value="Plywood">Plywood & Timber</option>
              <option value="Tiles">Tiles & Vitrified</option>
              <option value="Waterproofing">Waterproofing</option>
              <option value="Steel">Steel & Rebar</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF7F4] border border-[rgba(184,161,139,0.42)] rounded-xl px-3 py-2 text-[13px] text-[#23384F] focus:outline-none focus:border-[#23384F] cursor-pointer"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock / Direct Dispatch</option>
              <option value="low_stock">Low Inventory</option>
              <option value="backorder">On Demand / Backorder</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#FAF7F4] border border-[rgba(184,161,139,0.42)] rounded-xl px-3 py-2 text-[13px] text-[#23384F] focus:outline-none focus:border-[#23384F] cursor-pointer"
            >
              <option value="title_asc">Name (A → Z)</option>
              <option value="price_asc">Price (Low → High)</option>
              <option value="price_desc">Price (High → Low)</option>
              <option value="date_desc">Recently Added</option>
            </select>

            <button
              type="button"
              onClick={handleResetCatalog}
              title="Reset to standard Ostaad catalog"
              className="bg-white border border-[rgba(184,161,139,0.42)] text-[#23384F] hover:bg-[#FAF7F4] px-3 py-2 rounded-xl text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-[rgba(184,161,139,0.42)] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(35,56,79,0.04)] overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#FAF7F4] border-b border-[rgba(184,161,139,0.42)]">
                <th className="py-3.5 px-4 sm:px-5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#B8A18B]">
                  Product & Specification
                </th>
                <th className="py-3.5 px-4 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#B8A18B]">
                  Category
                </th>
                <th className="py-3.5 px-4 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#B8A18B]">
                  Compliance Standard
                </th>
                <th className="py-3.5 px-4 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#B8A18B]">
                  Verified Unit Price
                </th>
                <th className="py-3.5 px-4 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#B8A18B]">
                  Stock & Logistics
                </th>
                <th className="py-3.5 px-4 sm:px-5 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-[#B8A18B] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE4DE]">
              {displayedProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-[#B8A18B] font-mono"
                  >
                    No material specifications match your filter criteria.
                  </td>
                </tr>
              ) : (
                displayedProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#FAF7F4]/60 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl border border-[#EAE4DE] overflow-hidden bg-white shrink-0 relative">
                          <Image
                            src={
                              p.image ||
                              "/images/products/cement-jk53.jpg"
                            }
                            alt={p.title}
                            fill
                            sizes="48px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-[#23384F] line-clamp-1">
                            {p.title}
                          </span>
                          <span className="font-mono text-[11px] text-[#B8A18B] line-clamp-1">
                            {p.grade || "Standard Spec"} · {p.shipper || "Direct Mill"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10.5px] font-medium ${getCategoryClass(
                          p.category
                        )}`}
                      >
                        {p.category}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-xs text-[#54524D]">
                        {p.standard || "IS Standard Certified"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-mono text-[15px] font-bold text-[#23384F]">
                        ₹{Number(p.price).toLocaleString("en-IN")}
                      </div>
                      <span className="font-mono text-[10px] text-[#B8A18B] block">
                        {p.unit || "/ Unit"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(p.status || "in_stock")}
                        <span className="font-mono text-[10px] text-[#B8A18B]">
                          {p.leadTime || "24–48 Hours"}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Product"
                          className="w-8 h-8 rounded-lg border border-[#EAE4DE] bg-white hover:bg-[#FAF7F4] text-[#B8A18B] hover:text-[#23384F] grid place-items-center transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCloneProduct(p)}
                          title="Duplicate Spec"
                          className="w-8 h-8 rounded-lg border border-[#EAE4DE] bg-white hover:bg-[#FAF7F4] text-[#B8A18B] hover:text-[#23384F] grid place-items-center transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(p)}
                          title="Delete Product"
                          className="w-8 h-8 rounded-lg border border-[#EAE4DE] bg-white hover:bg-red-50 text-[#B8A18B] hover:text-red-600 hover:border-red-200 grid place-items-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Product Add / Edit Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        productTitle={deletingProduct?.title || ""}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification */}
      <div
        className={`fixed bottom-6 right-6 z-50 bg-[#23384F] text-white px-5 py-3 rounded-xl text-[13.5px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center gap-2.5 transition-all duration-300 pointer-events-none ${
          isToastVisible
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}

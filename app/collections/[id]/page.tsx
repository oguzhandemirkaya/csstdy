"use client";
import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ApiService } from "@/utils/apiService";
import Image from "next/image";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BsGrid3X3, BsGrid1X2Fill, BsGrid1X2, BsGrid3X2 } from 'react-icons/bs';
import { MdOutlineReportProblem, MdDelete, MdAdd, MdClose } from 'react-icons/md';
import { HiOutlineExclamation, HiOutlinePhotograph } from 'react-icons/hi';
import { FiFilter } from 'react-icons/fi';
import { BsFillExclamationOctagonFill } from 'react-icons/bs';
import CollectionsLayout from "@/components/CollectionsLayout";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store';
import { fetchProducts, ProductItem } from '../../../slices/productsSlice';
import { 
  fetchFilters, 
  setStockFilter, 
  setProductCodeFilter, 
  setSortOrder,
  setAllSizesInStock,
  setMinStock,
  setMaxStock,
  setWarehouseFilter,
  setYearFilter,
  setGeneralFilter,
  setGeneralFilterType,
  addSelectedFilter,
  removeSelectedFilter,
  clearFilters,
  updateAppliedFilters
} from '../../../slices/filtersSlice';
import {
  fetchPinnedProducts,
  updatePinnedProducts,
  togglePinProduct,
  setIsEditingPins,
  updatePinnedProductsData,
  reorderPinnedProducts
} from '../../../slices/pinnedProductsSlice';

interface DraggableProductCardProps {
  product: ProductItem;
  isPinned: (key: string) => boolean;
  onTogglePin: (productCode: string, colorCode: string) => void;
  inPinningMode: boolean;
  showPinRemoveButton: boolean;
  onRequestRemove?: (productCode: string, colorCode: string) => void;
  index?: number;
  moveCard?: (dragIndex: number, hoverIndex: number) => void;
}

interface DroppableAreaProps {
  children: ReactNode;
  onDrop: (product: ProductItem) => void;
}

interface DragItem {
  product: ProductItem;
}

type Filter = {
  id: string;
  title: string;
  values: {
    value: string;
    valueName: string | null;
  }[];
  comparisonType: number;
};

type SelectedFilter = {
  id: string;
  value: string;
  comparisonType: number;
};

type PageParams = {
  id: string;
};

type SortOption = {
  value: string;
  label: string;
};

// Ürün kartı
const DraggableProductCard = ({ product, isPinned, onTogglePin, inPinningMode, showPinRemoveButton, onRequestRemove, index, moveCard }: DraggableProductCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, dragRef] = useDrag({
    type: 'PRODUCT',
    item: { product, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });
  const [, drop] = useDrop({
    accept: 'PRODUCT',
    hover: (item: any, monitor) => {
      if (!ref.current || typeof item.index !== 'number' || typeof index !== 'number') return;
      if (item.index === index) return;
      moveCard && moveCard(item.index, index);
      item.index = index;
    },
  });
  dragRef(drop(ref));

  // Sabitlenme kontrolü
  const isProductPinned = isPinned(`${product.productCode}-${product.colorCode}`);

  return (
    <div
      ref={ref as any}
      key={`${product.productCode}-${product.colorCode}`}
      className={`relative overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md ${
        isDragging ? 'opacity-40' : 'opacity-100'
      } ${isProductPinned && inPinningMode ? 'border-indigo-500' : 'border-gray-200'}`}
      style={{ cursor: inPinningMode ? 'grab' : 'default' }}
    >
      <div className="relative h-64 w-full bg-gray-100">
        {product.imageUrl ? (
          <div className="relative h-full w-full">
            <img
              src={product.imageUrl}
              alt={product.name || "Ürün"}
              className={`h-full w-full object-cover ${isProductPinned && inPinningMode && !showPinRemoveButton ? 'blur-sm' : ''}`}
            />
            {isProductPinned && inPinningMode && !showPinRemoveButton && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-full bg-black bg-opacity-70 px-3 py-1 text-sm font-medium text-white">
                  Eklendi
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200 text-gray-500">
            <HiOutlinePhotograph className="h-8 w-8" />
            <span className="ml-2">Görsel Yok</span>
          </div>
        )}
        
        {inPinningMode && (
          showPinRemoveButton && isProductPinned ? (
            <button
              onClick={() => onRequestRemove && onRequestRemove(product.productCode, product.colorCode)}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition"
              title="Sabitlerden kaldır"
            >
              <MdDelete className="h-4 w-4" />
            </button>
          ) : (
            !isProductPinned && (
              <button
                onClick={() => {
                  onTogglePin(product.productCode, product.colorCode);
                  toast.success('Ürün sabitlere eklendi', {
                    position: "bottom-right",
                    autoClose: 2000
                  });
                }}
                className="absolute right-2 top-2 rounded-full bg-green-500 p-2 text-white hover:bg-green-600 transition"
                title="Sabitlere ekle"
              >
                <MdAdd className="h-4 w-4" />
              </button>
            )
          )
        )}
      </div>
      <div className="p-3 text-center">
        <h3 className="text-sm font-medium text-gray-900">
          {product.name || (product.productCode.length > 8 ? `${product.productCode.slice(0, 8)}...` : product.productCode)}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {product.productCode}
        </p>
      </div>
    </div>
  );
};

// Sabit alan bırakma alanı
const DroppableArea = ({ children, onDrop }: DroppableAreaProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'PRODUCT',
    drop: (item: DragItem) => onDrop(item.product),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={drop as any}
      className={`h-full w-full overflow-y-auto p-2 rounded-md border-2 ${isOver ? 'border-indigo-500 bg-indigo-50' : 'border-dashed border-gray-300'}`}
    >
      {children}
    </div>
  );
};

// Modal bileşeni
const ConfirmModal = ({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
        <MdOutlineReportProblem className="text-red-500" size={48} />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">Uyarı!</h2>
        <p className="mt-2 text-gray-800 text-center">Sabitlerden Çıkarılacaktır Emin Misiniz?</p>
        <div className="flex gap-4 mt-8 w-full justify-center">
          <button
            onClick={onCancel}
            className="flex-1 rounded-md bg-red-600 text-white py-2 font-semibold hover:bg-red-700 transition"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-md bg-emerald-500 text-white py-2 font-semibold hover:bg-emerald-600 transition"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CollectionDetail({ params }: { params: { id: string } }) {
  const collectionId = Number(params.id);
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state'leri
  const { items: products, totalProduct, loading: productsLoading, error: productsError } = useSelector((state: RootState) => state.products);
  const { 
    filters,
    selectedFilters,
    stockFilter,
    productCodeFilter,
    sortOrder,
    allSizesInStock,
    minStock,
    maxStock,
    warehouseFilter,
    yearFilter,
    generalFilter,
    generalFilterType,
    appliedFilters,
    loading: filtersLoading,
    error: filtersError
  } = useSelector((state: RootState) => state.filters);
  const {
    pinnedProducts,
    pinnedProductsData,
    isEditingPins,
    savingPins,
    loading: pinnedLoading,
    error: pinnedError
  } = useSelector((state: RootState) => state.pinnedProducts);

  // Local state'ler
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [pinnedView, setPinnedView] = useState<'2x2' | '3x2' | '4x2'>('2x2');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{ productCode: string; colorCode: string } | null>(null);
  
  const router = useRouter();
  const { data: session, status } = useSession();

  // Sıralama seçenekleri
  const sortOptions: SortOption[] = [
    { value: "", label: "Seçiniz" },
    { value: "nameAsc", label: "A-Z" },
    { value: "nameDesc", label: "Z-A" },
    { value: "priceAsc", label: "Fiyat (Artan)" },
    { value: "priceDesc", label: "Fiyat (Azalan)" },
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      dispatch(fetchProducts({ collectionId, page: currentPage, pageSize: 36, filters: selectedFilters }));
      dispatch(fetchFilters(collectionId));
      dispatch(fetchPinnedProducts(collectionId));
    }
  }, [status, router, collectionId, currentPage, selectedFilters, dispatch]);

  useEffect(() => {
    const pinnedData = products.filter(product => 
      pinnedProducts.includes(`${product.productCode}-${product.colorCode}`)
    );
    dispatch(updatePinnedProductsData(pinnedData));
  }, [pinnedProducts, products, dispatch]);

  const handleFilterChange = (id: string, value: string, comparisonType: number) => {
    dispatch(addSelectedFilter({ id, value, comparisonType }));
    setCurrentPage(1);
  };

  const applyFilters = () => {
    const newAppliedFilters: string[] = [];
    
    if (stockFilter) {
      newAppliedFilters.push(`Stok: ${stockFilter}`);
    }
    
    if (productCodeFilter) {
      newAppliedFilters.push(`Ürün Kodu: ${productCodeFilter}`);
    }
    
    if (sortOrder) {
      const selectedSort = sortOptions.find(option => option.value === sortOrder);
      if (selectedSort) {
        newAppliedFilters.push(`Sıralama: ${selectedSort.label}`);
      }
    }
    
    if (allSizesInStock) {
      newAppliedFilters.push("Tüm Bedenlerde Stok Olsun");
    }
    
    if (minStock) {
      newAppliedFilters.push(`Minimum Stok: ${minStock}`);
    }
    
    if (maxStock) {
      newAppliedFilters.push(`Maksimum Stok: ${maxStock}`);
    }
    
    if (warehouseFilter) {
      const warehouseInfo = filters.find(filter => filter.id === "warehouse")?.values.find(
        v => v.value === warehouseFilter
      );
      newAppliedFilters.push(`Depo: ${warehouseInfo?.valueName || warehouseFilter}`);
    }
    
    if (yearFilter) {
      const yearInfo = filters.find(filter => filter.id === "5")?.values.find(
        v => v.value === yearFilter
      );
      newAppliedFilters.push(`Yıl: ${yearInfo?.valueName || yearFilter}`);
    }
    
    if (generalFilter && generalFilterType) {
      const filterInfo = filters.find(filter => filter.id === generalFilterType);
      const valueInfo = filterInfo?.values.find(v => v.value === generalFilter);
      if (filterInfo && valueInfo) {
        newAppliedFilters.push(`${filterInfo.title}: ${valueInfo.valueName || generalFilter}`);
      }
    }
    
    dispatch(updateAppliedFilters(newAppliedFilters));
    setIsFilterModalOpen(false);
    setCurrentPage(1);
  };

  const handleFilterChangeWithType = (id: string, value: string) => {
    const filterInfo = filters.find(f => f.id === id);
    if (value && filterInfo) {
      dispatch(addSelectedFilter({ id, value, comparisonType: filterInfo.comparisonType }));
    } else {
      dispatch(removeSelectedFilter(id));
    }
  };

  const handleTogglePinProduct = (productCode: string, colorCode: string) => {
    const productKey = `${productCode}-${colorCode}`;
    dispatch(togglePinProduct(productKey));
  };

  const handleSavePinnedProducts = async () => {
    const newPinnedProducts = pinnedProductsData.map(p => `${p.productCode}-${p.colorCode}`);
    dispatch(updatePinnedProducts({ collectionId, pinnedProducts: newPinnedProducts }));
  };

  const handleCancelPinnedProductsEdit = () => {
    dispatch(fetchPinnedProducts(collectionId));
    dispatch(setIsEditingPins(false));
  };

  const handleDrop = (droppedProduct: ProductItem) => {
    const productKey = `${droppedProduct.productCode}-${droppedProduct.colorCode}`;
    if (!pinnedProducts.includes(productKey)) {
      dispatch(togglePinProduct(productKey));
      toast.success('Ürün başarıyla sabitlere eklendi');
    }
  };

  const handleReorderPinnedProducts = (dragIndex: number, hoverIndex: number) => {
    dispatch(reorderPinnedProducts({ dragIndex, hoverIndex }));
  };

  // Loading ve error durumları
  const loading = productsLoading || filtersLoading || pinnedLoading;
  const error = productsError || filtersError || pinnedError;

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 rounded-full bg-red-100 p-2 text-red-600 flex justify-center">
            <BsFillExclamationOctagonFill className="h-6 w-6" />
          </div>
          <p className="text-lg font-medium text-gray-900">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <CollectionsLayout title={isEditingPins ? "Sabitleri Düzenle" : "Koleksiyon Detayı"}>
        <div className="mb-6 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Ürün ara..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white text-sm mr-2"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {/* Aktif filtreler */}
            {selectedFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                {selectedFilters.map((filter, index) => {
                  const filterDef = filters.find(f => f.id === filter.id);
                  const valueName = filterDef?.values.find(v => v.value === filter.value)?.valueName || filter.value;
                  return (
                    <div key={index} className="flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-800">
                      <span>{filterDef?.title}: {valueName}</span>
                      <button
                        onClick={() => {
                          const newFilters = selectedFilters.filter((_, i) => i !== index);
                          dispatch(removeSelectedFilter(filter.id));
                          if (filter.id === "5") dispatch(setYearFilter(""));
                          if (filter.id === "warehouse") dispatch(setWarehouseFilter(""));
                          if (filter.id === generalFilterType) dispatch(setGeneralFilter(""));
                        }}
                        className="ml-1 bg-black text-white rounded-full p-1 hover:bg-white hover:text-black transition"
                      >
                        <MdClose className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => dispatch(clearFilters())}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-900 hover:bg-gray-200"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center ml-2">
            {/* Filtreler butonu */}
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center rounded-md border border-white bg-black text-white font-semibold px-4 py-2 shadow-sm hover:bg-white hover:text-black transition"
            >
              <span>Filtreler</span>
              <FiFilter className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Ürünler ve Sabitler Düzenleme Alanı */}
        {isEditingPins ? (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sabit Ürünleri Düzenle</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelPinnedProductsEdit}
                  className="rounded-md bg-black px-4 py-2 text-sm text-white font-semibold hover:bg-gray-800 transition"
                  disabled={savingPins}
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleSavePinnedProducts}
                  className="rounded-md bg-white px-4 py-2 text-sm text-black font-semibold hover:bg-gray-200 transition"
                  disabled={savingPins}
                >
                  {savingPins ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Sol: Koleksiyon Ürünleri */}
              <div>
                <h3 className="mb-2 font-medium text-gray-900">Koleksiyon Ürünleri</h3>
                <div className="h-[calc(100vh-300px)] overflow-y-auto bg-gray-50 rounded-md p-2 border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {products.map((product) => (
                      <DraggableProductCard
                        key={`${product.productCode}-${product.colorCode}`}
                        product={product}
                        isPinned={(key) => pinnedProducts.includes(key)}
                        onTogglePin={handleTogglePinProduct}
                        inPinningMode={true}
                        showPinRemoveButton={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {/* Sabitlenmiş Ürünler */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">Sabitler</h3>
                  <div className="flex border border-gray-200 rounded-md">
                    <button 
                      onClick={() => setPinnedView('2x2')} 
                      className={`p-1 ${pinnedView === '2x2' ? 'bg-gray-100' : ''}`}
                    >
                      <BsGrid1X2 className="h-5 w-5 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => setPinnedView('3x2')} 
                      className={`p-1 ${pinnedView === '3x2' ? 'bg-gray-100' : ''}`}
                    >
                      <BsGrid3X2 className="h-5 w-5 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => setPinnedView('4x2')} 
                      className={`p-1 ${pinnedView === '4x2' ? 'bg-gray-100' : ''}`}
                    >
                      <BsGrid3X3 className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                <DroppableArea onDrop={handleDrop}>
                  <div className="h-[calc(100vh-300px)] overflow-y-auto">
                    <div className={`grid gap-3 ${
                      pinnedView === '2x2' ? 'grid-cols-2' :
                      pinnedView === '3x2' ? 'grid-cols-3' :
                      'grid-cols-4'
                    }`}>
                      {pinnedProductsData.map((product, idx) => (
                        <DraggableProductCard
                          key={`pinned-${product.productCode}-${product.colorCode}`}
                          product={product}
                          isPinned={(key) => pinnedProducts.includes(key)}
                          onTogglePin={handleTogglePinProduct}
                          inPinningMode={true}
                          showPinRemoveButton={true}
                          onRequestRemove={(productCode, colorCode) => setConfirmRemove({ productCode, colorCode })}
                          index={idx}
                          moveCard={(dragIndex, hoverIndex) => {
                            dispatch(reorderPinnedProducts({ dragIndex, hoverIndex }));
                          }}
                        />
                      ))}
                      {/* Boş sabit kutuları */}
                      {Array.from({ length: Math.max(0, 6 - pinnedProductsData.length) }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white"
                        >
                          <div className="text-center text-gray-400">
                            <HiOutlinePhotograph className="mx-auto h-10 w-10" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DroppableArea>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Koleksiyon Ürünleri</h2>
              <div>
                <button
                  onClick={() => dispatch(setIsEditingPins(true))}
                  className="rounded-md bg-black px-4 py-2 text-sm text-white font-semibold hover:bg-gray-900 transition"
                >
                  Sabitleri Düzenle
                </button>
              </div>
            </div>
            {/* Ürün Listesi */}
            {products.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">Ürün bulunamadı.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className={`grid ${activeView === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'} gap-4`}>
                  {products.map((product) => (
                    <div
                      key={`${product.productCode}-${product.colorCode}`}
                      className={`overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md ${
                        pinnedProducts.includes(`${product.productCode}-${product.colorCode}`)
                          ? 'border-indigo-500'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="relative h-64 w-full bg-gray-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name || "Ürün"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gray-200 text-gray-500">
                            <HiOutlinePhotograph className="h-8 w-8" />
                            <span className="ml-2">Görsel Yok</span>
                          </div>
                        )}
                        {product.outOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                            <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-medium">
                              Tükendi
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 text-center">
                        <h3 className="text-sm font-medium text-gray-900">
                          {product.name || (product.productCode.length > 10 ? `${product.productCode.slice(0, 10)}...` : product.productCode)}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {product.productCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        {/* Filtreleme Modalı */}
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300" onClick={() => setIsFilterModalOpen(false)} />
            <div className="relative w-full max-w-none rounded-t-2xl bg-white p-6 shadow-2xl animate-slideUp">
              <div className="sticky top-0 z-10 bg-white pb-2 mb-2 flex items-center justify-between border-b">
                <h2 className="text-lg font-semibold text-gray-900">Gelişmiş Filtreler</h2>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="rounded-full p-1 bg-black text-white hover:bg-white hover:text-black transition"
                >
                  <MdClose className="h-5 w-5" />
                </button>
              </div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  applyFilters();
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pb-2">
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium mb-1 text-gray-900">Yıl</label>
                    <select
                      value={yearFilter}
                      onChange={e => {
                        dispatch(setYearFilter(e.target.value));
                        handleFilterChangeWithType("5", e.target.value);
                      }}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white text-sm"
                    >
                      <option value="">Seçiniz</option>
                      {filters.find(f => f.id === "5")?.values.map((val: { value: string; valueName: string | null }) => (
                        <option key={val.value} value={val.value} className="text-gray-900">
                          {val.valueName || val.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium mb-1 text-gray-900">Filtreler</label>
                    <select
                      value={generalFilterType}
                      onChange={e => {
                        dispatch(setGeneralFilterType(e.target.value));
                        dispatch(setGeneralFilter(""));
                      }}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white text-sm mb-2"
                    >
                      <option value="">Lütfen filtre seçiniz</option>
                      {filters.filter(f => f.id !== "5" && f.id !== "warehouse").map((f: Filter) => (
                        <option key={f.id} value={f.id}>{f.title}</option>
                      ))}
                    </select>
                    {generalFilterType && (
                      <select
                        value={generalFilter}
                        onChange={e => {
                          dispatch(setGeneralFilter(e.target.value));
                          handleFilterChangeWithType(generalFilterType, e.target.value);
                        }}
                        className="block w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white text-sm"
                      >
                        <option value="">Seçiniz</option>
                        {filters.find(f => f.id === generalFilterType)?.values.map((val: { value: string; valueName: string | null }) => (
                          <option key={val.value} value={val.value} className="text-gray-900">
                            {val.valueName || val.value}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {/* Depo Dropdown */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium mb-1 text-gray-900">Stok - Depo</label>
                    <select
                      value={warehouseFilter}
                      onChange={e => {
                        dispatch(setWarehouseFilter(e.target.value));
                        handleFilterChangeWithType("warehouse", e.target.value);
                      }}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white text-sm"
                    >
                      <option value="">Lütfen depo seçiniz</option>
                      {filters.find(f => f.id === "warehouse")?.values.map((val: { value: string; valueName: string | null }) => (
                        <option key={val.value} value={val.value} className="text-gray-900">
                          {val.valueName || val.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Minimum Stok */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium mb-1 text-gray-900">Minimum Stok</label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={e => dispatch(setMinStock(e.target.value))}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white text-sm"
                      placeholder="Minimum Stok"
                    />
                  </div>
                  {/* Maksimum Stok */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium mb-1 text-gray-900">Maksimum Stok</label>
                    <input
                      type="number"
                      value={maxStock}
                      onChange={e => dispatch(setMaxStock(e.target.value))}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white text-sm"
                      placeholder="Maksimum Stok"
                    />
                  </div>
                  {/* Tüm Bedenlerinde Stok Olanlar */}
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      checked={allSizesInStock}
                      onChange={e => dispatch(setAllSizesInStock(e.target.checked))}
                      className="mr-2"
                    />
                    <label className="text-xs font-medium text-gray-900">Tüm Bedenlerinde Stok Olanlar</label>
                  </div>
                  {/* Ürün Kodu */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium mb-1 text-gray-900">Ürün Kodu</label>
                    <input
                      type="text"
                      value={productCodeFilter}
                      onChange={e => dispatch(setProductCodeFilter(e.target.value))}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white text-sm"
                      placeholder="Seçiniz"
                    />
                  </div>
                  {/* Sıralamalar Dropdown */}
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium mb-1 text-gray-900">Sıralamalar</label>
                    <select
                      value={sortOrder}
                      onChange={e => dispatch(setSortOrder(e.target.value))}
                      className="block w-full rounded-md border border-gray-300 px-2 py-1 text-gray-900 bg-white text-sm"
                    >
                      <option value="">Seçiniz</option>
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => dispatch(clearFilters())}
                    className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-900 hover:bg-gray-200"
                  >
                    Temizle
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-black px-4 py-2 text-sm text-white font-semibold hover:bg-gray-900 transition"
                  >
                    Filtrele
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          aria-label="Toast Bildirimleri"
        />
        {/* Confirm Modal */}
        <ConfirmModal
          open={!!confirmRemove}
          onCancel={() => setConfirmRemove(null)}
          onConfirm={async () => {
            if (confirmRemove) {
              const { productCode, colorCode } = confirmRemove;
              try {
                handleTogglePinProduct(productCode, colorCode);
                setConfirmRemove(null);
                toast.success('Ürün sabitlerden kaldırıldı', {
                  position: "bottom-right",
                  autoClose: 2000
                });
              } catch (err) {
                setConfirmRemove(null);
                toast.error('Bir hata oluştu, tekrar deneyin', {
                  position: "bottom-right",
                  autoClose: 2000
                });
              }
            }
          }}
        />
      </CollectionsLayout>
    </DndProvider>
  );
} 
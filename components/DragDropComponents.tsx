"use client";

import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FiHome, 
  FiBox, 
  FiMoon, 
  FiBell, 
  FiFilter, 
  FiList, 
  FiGrid, 
  FiX, 
  FiImage, 
  FiTrash2, 
  FiPlus 
} from 'react-icons/fi';


type ProductItem = {
  productCode: string;
  colorCode: string;
  name: string | null;
  outOfStock: boolean;
  isSaleB2B: boolean;
  imageUrl: string;
};
interface DraggableProductCardProps {
  product: ProductItem;
  isPinned: (key: string) => boolean;
  onTogglePin: (productCode: string, colorCode: string) => void;
  inPinningMode: boolean;
  showPinRemoveButton: boolean;
}

interface DroppableAreaProps {
  children: React.ReactNode;
  onDrop: (product: ProductItem) => void;
}

interface DragItem {
  product: ProductItem;
}

// Drag & Drop bileşenleri
const DraggableProductCard = ({ product, isPinned, onTogglePin, inPinningMode, showPinRemoveButton }: DraggableProductCardProps) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: 'PRODUCT',
    item: { product },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const isProductPinned = isPinned(`${product.productCode}-${product.colorCode}`);

  return (
    <div
      ref={dragRef as unknown as React.RefObject<HTMLDivElement>}
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
            <FiImage className="mx-auto h-10 w-10" />
          </div>
        )}
        
        {inPinningMode && (
          showPinRemoveButton && isProductPinned ? (
            <button
              onClick={() => {
                if (confirm('Bu ürünü sabitlerden kaldırmak istediğinize emin misiniz?')) {
                  onTogglePin(product.productCode, product.colorCode);
                  toast.success('Ürün sabitlerden kaldırıldı');
                }
              }}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white hover:bg-red-600 transition"
              title="Sabitlerden kaldır"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          ) : (
            !isProductPinned && (
              <button
                onClick={() => {
                  onTogglePin(product.productCode, product.colorCode);
                  toast.success('Ürün sabitlere eklendi');
                }}
                className="absolute right-2 top-2 rounded-full bg-green-500 p-2 text-white hover:bg-green-600 transition"
                title="Sabitlere ekle"
              >
                <FiPlus className="h-4 w-4" />
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

const DroppableArea = ({ children, onDrop }: DroppableAreaProps) => {
  const [{ isOver }, dropRef] = useDrop({
    accept: 'PRODUCT',
    drop: (item: DragItem) => onDrop(item.product),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div 
      ref={dropRef as unknown as React.RefObject<HTMLDivElement>}
      className={`h-full w-full overflow-y-auto p-2 rounded-md border-2 ${isOver ? 'border-indigo-500 bg-indigo-50' : 'border-dashed border-gray-300'}`}
    >
      {children}
    </div>
  );
};

// Ana bileşen
interface DragDropComponentsProps {
  products: ProductItem[];
  pinnedProducts: string[];
  pinnedProductsData: ProductItem[];
  togglePinProduct: (productCode: string, colorCode: string) => void;
  savePinnedProducts: () => void;
  cancelPinnedProductsEdit: () => void;
  isEditingPins: boolean;
  setIsEditingPins: (value: boolean) => void;
  savingPins: boolean;
  sortedProducts: ProductItem[];
  appliedFilters: string[];
  setAppliedFilters: (filters: string[]) => void;
  clearFilters: () => void;
  isFilterModalOpen: boolean;
  setIsFilterModalOpen: (value: boolean) => void;
  router: any;
  collectionId: string;
}

export default function DragDropComponents(props: DragDropComponentsProps) {
  const { 
    products, 
    pinnedProducts, 
    pinnedProductsData, 
    togglePinProduct,
    savePinnedProducts,
    cancelPinnedProductsEdit,
    isEditingPins, 
    setIsEditingPins,
    savingPins,
    sortedProducts,
    appliedFilters,
    clearFilters,
    isFilterModalOpen,
    setIsFilterModalOpen,
    router,
    collectionId
  } = props;

  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  
  // Drag & Drop işlevselliği
  const handleDrop = (droppedProduct: ProductItem) => {
    const productKey = `${droppedProduct.productCode}-${droppedProduct.colorCode}`;
    
    // Ürün zaten sabitlenmemişse ekle
    if (!pinnedProducts.includes(productKey)) {
      togglePinProduct(droppedProduct.productCode, droppedProduct.colorCode);
      toast.success('Ürün başarıyla sabitlere eklendi');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen overflow-hidden">
        {/* Sol Menü */}
        <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="text-xl font-bold">LOGO</div>
          </div>
          
          <div className="p-4 border-b border-gray-200 text-sm font-medium text-gray-500">
            MENÜ
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center w-full p-2 rounded-md hover:bg-gray-100"
                >
                  <FiHome className="h-5 w-5 mr-2" />
                  Dashboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => router.push("/collections")}
                  className="flex items-center w-full p-2 rounded-md bg-gray-100 text-indigo-600"
                >
                  <FiBox className="h-5 w-5 mr-2" />
                  Koleksiyon
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Ana İçerik */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Üst Navbar */}
          <div className="bg-white border-b border-gray-200 py-2 px-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {isEditingPins ? "Sabitleri Düzenle" : "Koleksiyon Detayı"}
              </h1>
              <p className="text-sm text-gray-500">
                Koleksiyon - {collectionId} / {products.length} Ürün
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Tema Düğmesi */}
              <button className="p-1 rounded-full hover:bg-gray-100">
                <FiMoon className="h-6 w-6 text-gray-600" />
              </button>
              
              {/* Bildirimler */}
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <FiBell className="h-6 w-6 text-gray-600" />
                </button>
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white">
                  5
                </span>
              </div>
              
              {/* Kullanıcı */}
              <button className="w-8 h-8 rounded-full bg-gray-300"></button>
            </div>
          </div>
          
          {/* İçerik Alanı */}
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="container mx-auto px-4 py-6">
              <div className="mb-6 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2">
                <div className="flex items-center">
                </div>
                
                <div className="flex items-center">
                  <button 
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex items-center rounded-md border border-gray-300 px-3 py-1 mr-2"
                  >
                    <span>Filtreler</span>
                    <FiFilter className="ml-2 h-4 w-4" />
                  </button>
                  
                  <div className="flex border border-gray-200 rounded-md">
                    <button 
                      onClick={() => setActiveView('list')} 
                      className={`p-1 ${activeView === 'list' ? 'bg-gray-100' : ''}`}
                    >
                      <FiList className="h-6 w-6 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => setActiveView('grid')} 
                      className={`p-1 ${activeView === 'grid' ? 'bg-gray-100' : ''}`}
                    >
                      <FiGrid className="h-6 w-6 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ürünler ve Sabitler Düzenleme Alanı */}
              {isEditingPins ? (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Sabit Ürünleri Düzenle</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={cancelPinnedProductsEdit}
                        className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                        disabled={savingPins}
                      >
                        Vazgeç
                      </button>
                      <button
                        onClick={savePinnedProducts}
                        className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                        disabled={savingPins}
                      >
                        {savingPins ? "Kaydediliyor..." : "Kaydet"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Sol: Koleksiyon Ürünleri */}
                    <div>
                      <h3 className="mb-2 font-medium">Koleksiyon Ürünleri</h3>
                      <div className="h-[calc(100vh-300px)] overflow-y-auto bg-gray-50 rounded-md p-2 border border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {products.map((product) => (
                            <DraggableProductCard
                              key={`${product.productCode}-${product.colorCode}`}
                              product={product}
                              isPinned={(key) => pinnedProducts.includes(key)}
                              onTogglePin={togglePinProduct}
                              inPinningMode={true}
                              showPinRemoveButton={false}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Sağ: Sabitlenmiş Ürünler */}
                    <div>
                      <h3 className="mb-2 font-medium">Sabitler</h3>
                      <DroppableArea onDrop={handleDrop}>
                        <div className="h-[calc(100vh-300px)] overflow-y-auto">
                          <div className="grid grid-cols-2 gap-3">
                            {pinnedProductsData.map((product) => (
                              <DraggableProductCard
                                key={`pinned-${product.productCode}-${product.colorCode}`}
                                product={product}
                                isPinned={(key) => pinnedProducts.includes(key)}
                                onTogglePin={togglePinProduct}
                                inPinningMode={true}
                                showPinRemoveButton={true}
                              />
                            ))}
                            
                            {/* Boş sabit kutuları (mockup'a uygun olarak) */}
                            {Array.from({ length: Math.max(0, 6 - pinnedProductsData.length) }).map((_, index) => (
                              <div
                                key={`empty-${index}`}
                                className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white"
                              >
                                <div className="text-center text-gray-400">
                                  <FiImage className="mx-auto h-10 w-10" />
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
                    <h2 className="text-lg font-semibold">Koleksiyon Ürünleri</h2>
                    <div>
                      <button
                        onClick={() => setIsEditingPins(true)}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                      >
                        Sabitleri Düzenle
                      </button>
                    </div>
                  </div>

                  {/* Aktif filtreler */}
                  {appliedFilters.length > 0 && (
                    <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
                      <h3 className="mb-2 text-sm font-medium text-gray-700">Aktif Filtreler:</h3>
                      <div className="flex flex-wrap gap-2">
                        {appliedFilters.map((filter, index) => (
                          <div 
                            key={index} 
                            className="flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-800"
                          >
                            <span>{filter}</span>
                          </div>
                        ))}
                        <button
                          onClick={clearFilters}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                        >
                          Filtreleri Temizle
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ürün Listesi */}
                  {sortedProducts.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
                      <p className="text-gray-500">Ürün bulunamadı.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <div className={`grid ${activeView === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'} gap-4`}>
                        {sortedProducts.map((product) => (
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
                                  <FiImage className="mx-auto h-10 w-10" />
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
            </div>
          </div>
        </div>
      </div>

      {/* Filtreleme Modalı */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Gelişmiş Filtreler</h2>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
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
    </DndProvider>
  );
} 
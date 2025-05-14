"use client";
import { useEffect, useState } from "react";
import { ApiService } from "@/utils/apiService";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CollectionsLayout from "@/components/CollectionsLayout";
import { MdClose } from 'react-icons/md';
import { FiEdit2 } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCollections } from '../../slices/collectionsSlice';

type Collection = {
  id: number;
  info: {
    id: number;
    name: string;
    description: string;
    url: string;
    langCode: string;
  };
  filters?: {
    useOrLogic: boolean;
    filters: {
      id: string;
      title: string;
      value: string;
      valueName?: string;
      currency?: string | null;
      comparisonType?: number;
    }[];
  };
  salesChannelId?: number;
};

export default function Collections() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: collections, loading, error } = useSelector((state: RootState) => state.collections);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated") {
      dispatch(fetchCollections());
    }
  }, [status, router, dispatch]);

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
            <MdClose className="h-6 w-6" />
          </div>
          <p className="text-lg font-medium text-gray-900">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <CollectionsLayout title="Koleksiyonlar">
      {collections.length === 0 ? (
        <p className="text-center text-gray-500">Koleksiyon bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-sm font-semibold text-gray-900 border-b">
                <th className="py-2 px-4">Başlık</th>
                <th className="py-2 px-4">Ürün Koşulları</th>
                <th className="py-2 px-4">Satış Kanalı</th>
                <th className="py-2 px-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection.id} className="bg-white border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4 align-top font-medium text-gray-900">{collection.info.name}</td>
                  <td className="py-3 px-4 align-top">
                    {collection.filters && collection.filters.filters && collection.filters.filters.length > 0 ? (
                      <ul className="space-y-1">
                        {collection.filters.filters.map((filter: any, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700">
                            {filter.title} bilgisi Şuna Eşit: {filter.valueName || filter.value}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-gray-400">Koşul yok</span>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top text-gray-900">Satış Kanalı - {collection.salesChannelId || '-'}</td>
                  <td className="py-3 px-4 align-top">
                    <button
                      onClick={() => router.push(`/collections/${collection.id}`)}
                      className="p-2 rounded hover:bg-gray-100 transition"
                      title="Sabitleri düzenle"
                    >
                      <FiEdit2 className="h-5 w-5 text-gray-700" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CollectionsLayout>
  );
} 
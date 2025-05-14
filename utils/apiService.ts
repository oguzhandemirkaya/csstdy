import { getSession } from "next-auth/react";

// Doğrudan API URL yerine proxy URL kullanacağız (CORS sorununu önlemek için)
// const BASE_URL = "https://maestro-api-dev.secil.biz";
const BASE_URL = "/api/secil"; // Next.js proxy ile yönlendirilecek

// Size verilen token - Postman koleksiyonunda YOUR_SECRET_TOKEN olarak gösteriliyor
const AUTH_TOKEN = "grIf9e7YTSSP3J8LLdI0LwodIDZ1qn";

export const ApiService = {
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    try {
      const session = await getSession();
      const accessToken = session?.user?.accessToken;

      // Login yaparken verdiğimiz token, API isteklerinde ise login sonucu aldığımız accessToken kullanılmalı
      let headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...options.headers as Record<string, string>,
      };

      // Login olduktan sonra alınan accessToken kullanılmalı
      if (accessToken) {
        // Postman'da Bearer token için "Bearer" prefix kullanılıyor (GetProducts endpoint'inde görülebilir)
        headers["Authorization"] = `Bearer ${accessToken}`;
        console.log("Oturum bulundu, Bearer token kullanılıyor");
      } else {
        // Eğer oturum yoksa (login işlemi için) direkt token kullanılmalı
        headers["Authorization"] = AUTH_TOKEN;
        console.log("Oturum bulunamadı, AUTH_TOKEN kullanılıyor");
      }
      
      console.log(`API isteği yapılıyor: ${BASE_URL}${endpoint}`);
      console.log(`Authorization: ${headers["Authorization"].startsWith("Bearer") ? "Bearer [token]" : "Direkt token"}`);
      
      if (options.body) {
        console.log("Request Body:", options.body);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API isteği başarısız oldu: ${response.status} ${response.statusText}`);
        console.error(`URL: ${BASE_URL}${endpoint}`);
        console.error(`Yanıt: ${errorText || "Boş yanıt"}`);
        throw new Error(`API isteği başarısız oldu: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`API yanıtı başarılı (${response.status})`);
      return responseData;
    } catch (error) {
      console.error("API isteği sırasında hata oluştu:", error);
      throw error;
    }
  },

  // Koleksiyonları getir
  async getCollections() {
    return this.fetchWithAuth("/Collection/GetAll");
  },

  // Koleksiyon ürünlerini getir
  async getCollectionProducts(collectionId: number, page = 1, pageSize = 36, filters: any = []) {
    return this.fetchWithAuth(`/Collection/${collectionId}/GetProductsForConstants`, {
      method: "POST",
      body: JSON.stringify({
        additionalFilters: filters,
        page,
        pageSize,
      }),
    });
  },

  // Koleksiyon filtrelerini getir
  async getCollectionFilters(collectionId: number) {
    return this.fetchWithAuth(`/Collection/${collectionId}/GetFiltersForConstants`);
  },

  // Sabitlenmiş ürünleri getir - localStorage kullanarak
  async getConstantProducts(collectionId: number) {
    try {
      console.log("Sabitlenmiş ürünler localStorage'dan getiriliyor");
      // LocalStorage'dan koleksiyon için sabitlenmiş ürünleri al
      const pinnedProducts = localStorage.getItem(`pinnedProducts_${collectionId}`);
      
      // Başarılı bir API yanıtını simüle ediyoruz
      return {
        status: 200,
        data: {
          constants: pinnedProducts ? JSON.parse(pinnedProducts) : []
        }
      };
    } catch (error) {
      console.error("Sabitlenmiş ürünler getirilemedi:", error);
      // Hata durumunda boş bir array dön
      return {
        status: 200,
        data: {
          constants: []
        }
      };
    }
  },

  // Sabitlenmiş ürünleri güncelle - localStorage kullanarak
  async updateConstantProducts(collectionId: number, constantProducts: string[]) {
    try {
      console.log("Sabitlenmiş ürünler localStorage'a kaydediliyor");
      // LocalStorage'a kaydet
      localStorage.setItem(`pinnedProducts_${collectionId}`, JSON.stringify(constantProducts));
      
      // Başarılı bir API yanıtını simüle ediyoruz
      return {
        status: 200,
        data: {
          message: "Sabitler başarıyla güncellendi"
        }
      };
    } catch (error) {
      console.error("Sabitlenmiş ürünler kaydedilemedi:", error);
      throw error;
    }
  }
}; 
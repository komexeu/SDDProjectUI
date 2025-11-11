// Mock API 服務，用於開發測試
import type { 
  Product, 
  ProductListResponse, 
  OrderDetail, 
  CreateOrderRequest, 
  CreateOrderResponse,
  ApiResponse 
} from '../types/api';

// 模擬商品資料
const mockProducts: Product[] = [
  {
    id: '1',
    name: '珍珠奶茶',
    code: 'P001',
    description: '經典台式飲品，Q彈珍珠配香醇奶茶',
    price: 65,
    stock: 50,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '2',
    name: '雞排便當',
    code: 'P002',
    description: '酥脆雞排配白飯和三樣配菜',
    price: 120,
    stock: 30,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '3',
    name: '滷肉飯',
    code: 'P003',
    description: '傳統台式滷肉飯，香濃不膩',
    price: 45,
    stock: 25,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isActive: true
  },
  {
    id: '4',
    name: '鳳梨酥',
    code: 'P004',
    description: '台灣特產，酸甜鳳梨內餡',
    price: 35,
    stock: 0, // 缺貨商品
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    isActive: true
  }
];

// 模擬訂單資料
const mockOrders: OrderDetail[] = [
  {
    orderId: 'ORD001',
    userId: 'user001',
    description: '測試訂單',
    status: 'pending',
    totalAmount: 185,
    itemCount: 3,
    createdAt: '2024-11-08T10:30:00.000Z',
    updatedAt: '2024-11-08T10:30:00.000Z',
    items: [
      {
        id: 'item001',
        productId: '1',
        name: '珍珠奶茶',
        quantity: 2,
        price: 65,
        totalPrice: 130
      },
      {
        id: 'item002',
        productId: '3',
        name: '滷肉飯',
        quantity: 1,
        price: 45,
        totalPrice: 45
      }
    ]
  }
];

// Mock API 服務
export const mockApi = {
  // 商品相關
  async getProducts(): Promise<ApiResponse<ProductListResponse>> {
    await delay(500); // 模擬網路延遲
    return {
      success: true,
      data: {
        products: mockProducts,
        total: mockProducts.length
      }
    };
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    await delay(300);
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return {
      success: true,
      data: product
    };
  },

  // 訂單相關
  async getOrders(): Promise<ApiResponse<{ orders: OrderDetail[] }>> {
    await delay(500);
    return {
      success: true,
      data: {
        orders: mockOrders
      }
    };
  },

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
    await delay(800); // 模擬較長的處理時間
    
    // 驗證庫存
    for (const item of data.items) {
      const product = mockProducts.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        throw new Error(`商品 ${item.name} 庫存不足`);
      }
    }

    // 計算總金額
    const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = data.items.reduce((sum, item) => sum + item.quantity, 0);

    const newOrder: CreateOrderResponse = {
      orderId: `ORD${Date.now()}`,
      userId: data.userId,
      description: data.description || '',
      status: 'pending',
      totalAmount,
      itemCount,
      createdAt: new Date().toISOString(),
      items: data.items.map(item => ({
        ...item,
        totalPrice: item.price * item.quantity
      }))
    };

    // 更新庫存（模擬）
    for (const item of data.items) {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product) {
        product.stock -= item.quantity;
      }
    }

    // 添加到訂單列表（模擬）
    mockOrders.unshift({
      ...newOrder,
      updatedAt: newOrder.createdAt
    });

    return {
      success: true,
      data: newOrder
    };
  },

  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    await delay(300);
    const index = mockOrders.findIndex(order => order.orderId === id);
    if (index === -1) {
      throw new Error('Order not found');
    }
    mockOrders.splice(index, 1);
    return {
      success: true,
      data: undefined
    };
  }
};

// 輔助函數：模擬延遲
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 開發模式檢查
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development' || import.meta.env.VITE_USE_MOCK === 'true';
};
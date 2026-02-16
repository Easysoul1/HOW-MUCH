import { Button } from "@/components/ui/button";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Edit2, MoreVertical, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export default function VendorProductsPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-milano font-bold text-black">Products</h1>
           <p className="text-gray-500">Manage your inventory and pricing.</p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-800">
             <Plus className="w-4 h-4 mr-2" />
             Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-gray-100">
                       <Image 
                         src={product.imageUrl} 
                         alt={product.name}
                         fill
                         className="object-cover"
                       />
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                           <button className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-black">
                               <Edit2 className="w-4 h-4" />
                           </button>
                       </div>
                  </div>
                  <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h3 className="font-medium text-black truncate pr-4">{product.name}</h3>
                              <p className="text-xs text-gray-500">{product.category}</p>
                          </div>
                          <button className="text-gray-400 hover:text-black">
                              <MoreVertical className="w-4 h-4" />
                          </button>
                      </div>
                      <div className="flex items-end justify-between mt-4">
                          <div>
                              <span className="text-lg font-bold text-black">₦{product.price.toLocaleString()}</span>
                              {product.previousPrice && (
                                  <span className="text-xs text-gray-400 line-through ml-2">₦{product.previousPrice.toLocaleString()}</span>
                              )}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-md ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                              {product.stock} in stock
                          </div>
                      </div>
                  </div>
              </div>
          ))}
          
          {/* Add New Card Placeholder */}
          <button className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 hover:border-black hover:bg-gray-100 transition-colors aspect-square">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Plus className="w-6 h-6 text-black" />
              </div>
              <span className="font-medium text-gray-500">Add New Product</span>
          </button>
      </div>
    </div>
  );
}

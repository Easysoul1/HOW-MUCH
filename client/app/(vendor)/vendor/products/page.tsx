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
           <p className="text-muted-foreground">Manage your inventory and pricing.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90">
             <Plus className="w-4 h-4 mr-2" />
             Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((product) => (
              <div key={product.id} className="bg-white dark:bg-dark-panel rounded-xl border border-light-border dark:border-dark-border overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-light-panel dark:bg-dark-elevated">
                       <Image 
                         src={product.imageUrl} 
                         alt={product.name}
                         fill
                         className="object-cover"
                       />
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                           <button className="p-2 bg-white dark:bg-dark-panel rounded-full shadow-sm hover:bg-light-panel dark:hover:bg-dark-elevated text-foreground">
                               <Edit2 className="w-4 h-4" />
                           </button>
                       </div>
                  </div>
                  <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h3 className="font-medium text-black truncate pr-4">{product.name}</h3>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                          <button className="text-muted-foreground hover:text-foreground">
                              <MoreVertical className="w-4 h-4" />
                          </button>
                      </div>
                      <div className="flex items-end justify-between mt-4">
                          <div>
                              <span className="text-lg font-bold text-black">₦{product.price.toLocaleString()}</span>
                              {product.previousPrice && (
                                  <span className="text-xs text-muted-foreground line-through ml-2">₦{product.previousPrice.toLocaleString()}</span>
                              )}
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-md ${product.stock < 10 ? 'bg-status-danger/10 text-status-danger' : 'bg-status-success/10 text-status-success'}`}>
                              {product.stock} in stock
                          </div>
                      </div>
                  </div>
              </div>
          ))}
          
          {/* Add New Card Placeholder */}
          <button className="bg-light-panel dark:bg-dark-elevated rounded-xl border-2 border-dashed border-light-border dark:border-dark-border flex flex-col items-center justify-center gap-4 hover:border-primary dark:hover:border-accent hover:bg-white dark:hover:bg-dark-panel transition-colors aspect-square">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-dark-panel flex items-center justify-center shadow-sm">
                  <Plus className="w-6 h-6 text-foreground" />
              </div>
              <span className="font-medium text-muted-foreground">Add New Product</span>
          </button>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Headphones, Watch, Tablet } from 'lucide-react';

const categories = [
  { id: 'phone', name: 'Điện thoại', icon: Smartphone },
  { id: 'laptop', name: 'Laptop', icon: Laptop },
  { id: 'headphone', name: 'Tai nghe', icon: Headphones },
  { id: 'watch', name: 'Đồng hồ', icon: Watch },
  { id: 'tablet', name: 'Tablet', icon: Tablet },
];

export default function CategoryNav() {
  return (
    <div className="bg-white shadow-sm mb-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between md:justify-center items-center py-4 overflow-x-auto hide-scrollbar gap-4 md:gap-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={cat.id} 
                to={`/category/${cat.id}`}
                className="flex flex-col items-center justify-center min-w-[80px] p-2 rounded-lg hover:bg-blue-50 transition-colors group"
              >
                <div className="bg-gray-100 p-3 rounded-full mb-2 group-hover:bg-blue-100 transition-colors">
                  <Icon className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
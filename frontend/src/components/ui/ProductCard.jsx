import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { resolveMediaUrl } from '../../utils/resolveMediaUrl';
import heroImage from '../../assets/hero.png';

export default function ProductCard({ product }) {
  if (!product) return null;

  const { id, name, base_price, main_image, price, imageUrl } = product;
  const resolvedImage = resolveMediaUrl(main_image || imageUrl) || heroImage;
  const rawPrice = base_price ?? price;
  const priceNumber = Number(String(rawPrice ?? 0).replace(/,/g, ''));

  return (
    <Link 
      to={`/product/${id}`}
      className="group bg-white rounded-lg shadow border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-50">
        <img 
          src={resolvedImage} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-gray-800 text-sm md:text-base font-medium line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        
        <div className="mt-auto">
          <span className="text-red-600 font-bold text-lg">
            {formatCurrency(priceNumber)}
          </span>
        </div>
      </div>
    </Link>
  );
}
import { Link } from "@remix-run/react";

interface CategoryCardProps {
  id: string;
  name: string;
  image: string;
}

export function CategoryCard({ id, name, image }: CategoryCardProps) {
  return (
    <Link 
      to={`/app/category/${id}`}
      className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
    >
      <div className="aspect-square relative bg-gray-50">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-contain p-6" 
        />
      </div>
      <div className="p-3 text-center border-t border-gray-100 bg-white">
        <h3 className="font-medium text-black">{name}</h3>
      </div>
    </Link>
  );
}
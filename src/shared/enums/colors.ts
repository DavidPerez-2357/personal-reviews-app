import { Category } from '@/shared/dto/category/Category';

export const CategoryColors: Record<Category['color'], string> = {
    'red': '#B50003',
    'green': '#21B500',
    'blue': '#0003B5',
    'yellow': '#B5A000',
    'gray': '#9194A0',
    'darkgray': '#393E46',
    'turquoise': '#00959C',
    'purple': '#AC00B5',
}

export const SubCategoryColors: Record<Category['color'], string> = {
    'red': '#940002',
    'green': '#1A8E00',
    'blue': '#7F7FFF',
    'yellow': '#FFFF7F',
    'gray': '#D3D3D3',
    'darkgray': '#A9A9A9',
    'turquoise': '#00666E',
    'purple': '#E6E6FA',
}
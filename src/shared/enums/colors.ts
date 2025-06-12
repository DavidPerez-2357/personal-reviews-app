import { Category } from "@dto/Category"


export const CategoryColors: Record<string, string> = {
    'red': '#B50000',
    'crimson': '#DC143C',
    'bordeaux': '#9D3050',
    'purple': '#8800B5',
    'violet': '#B5009A',
    'salmon': '#F17871',
    'cyan': '#00ADB5',
    'blue': '#0045B5',
    'forest': '#218C22',
    'green': '#21B500',
    'turquoise': '#00B55E',
    'gold': '#BA8E15',
    'yellow': '#D2B600',
    'pumpkin': '#F78800',
    'orange': '#F05000',
    'rust': '#B7410E',
    'brown': '#793B00',
    'gray': '#767676',
}

export const SubCategoryColors: Record<Category['color'], string> = {
    'red': '#940002',
    'crimson': '#A50E2D',
    'bordeaux': '#6E1F3D',
    'purple': '#5E0085',
    'violet': '#800051',
    'salmon': '#B6635F',
    'cyan': '#008585',
    'blue': '#002B99',
    'forest': '#1B5E20',
    'green': '#188300',
    'turquoise': '#007A33',
    'gold': '#8B6A2B',
    'yellow': '#B38000',
    'pumpkin': '#C76D00',
    'orange': '#B63D00',
    'rust': '#8A330E',
    'brown': '#4E2A00',
    'gray': '#4E4E4E',
}
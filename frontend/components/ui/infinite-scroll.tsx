// https://github.com/hsuanyi-chou/shadcn-ui-expansions/tree/main


import React from 'react';

interface InfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  next: () => unknown;
  threshold?: number;
  root?: Element | Document | null;
  rootMargin?: string;
  reverse?: boolean;
  children?: React.ReactNode;
}

export default function InfiniteScroll({
  isLoading,
  hasMore,
  next,
  threshold = 1,
  root = null,
  rootMargin = '0px',
  reverse,
  children,
}: InfiniteScrollProps) {
  const observer = React.useRef<IntersectionObserver>();
  // This callback ref will be called when it is dispatched to an element or detached from an element,
  // or when the callback function changes.
  const observerRef = React.useCallback(
    (element: HTMLElement | null) => {
      let safeThreshold = threshold;
      if (threshold < 0 || threshold > 1) {
        console.warn(
          'threshold should be between 0 and 1. You are exceed the range. will use default value: 1',
        );
        safeThreshold = 1;
      }
      // When isLoading is true, this callback will do nothing.
      // It means that the next function will never be called.
      // It is safe because the intersection observer has disconnected the previous element.
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();
      if (!element) return;

      // Create a new IntersectionObserver instance because hasMore or next may be changed.
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            next();
          }
        },
        { threshold: safeThreshold, root, rootMargin },
      );
      observer.current.observe(element);
    },
    [hasMore, isLoading, next, threshold, root, rootMargin],
  );

  const flattenChildren = React.useMemo(() => React.Children.toArray(children), [children]);

  return (
    <>
      {flattenChildren.map((child, index) => {
        if (!React.isValidElement(child)) {
          process.env.NODE_ENV === 'development' &&
            console.warn('You should use a valid element with InfiniteScroll');
          return child;
        }

        const isObserveTarget = reverse ? index === 0 : index === flattenChildren.length - 1;
        const ref = isObserveTarget ? observerRef : null;
        // @ts-ignore ignore ref type
        return React.cloneElement(child, { ref });
      })}
    </>
  );
}




// 'use client';
// import React from 'react';
// import InfiniteScroll from '@/components/ui/infinite-scroll';
// import { Loader2 } from 'lucide-react';

// interface DummyProductResponse {
//   products: DummyProduct[];
//   total: number;
//   skip: number;
//   limit: number;
// }

// interface DummyProduct {
//   id: number;
//   title: string;
//   price: string;
// }

// const Product = ({ product }: { product: DummyProduct }) => {
//   return (
//     <div className="flex w-full flex-col gap-2 rounded-lg border-2 border-gray-200 p-2">
//       <div className="flex gap-2">
//         <div className="flex flex-col justify-center gap-1">
//           <div className="font-bold text-primary">
//             {product.id} - {product.title}
//           </div>
//           <div className="text-sm text-muted-foreground">{product.price}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const InfiniteScrollDemo = () => {
//   const [page, setPage] = React.useState(0);
//   const [loading, setLoading] = React.useState(false);
//   const [hasMore, setHasMore] = React.useState(true);
//   const [products, setProducts] = React.useState<DummyProduct[]>([]);

//   const next = async () => {
//     setLoading(true);

//     /**
//      * Intentionally delay the search by 800ms before execution so that you can see the loading spinner.
//      * In your app, you can remove this setTimeout.
//      **/
//     setTimeout(async () => {
//       const res = await fetch(
//         `https://dummyjson.com/products?limit=3&skip=${3 * page}&select=title,price`,
//       );
//       const data = (await res.json()) as DummyProductResponse;
//       setProducts((prev) => [...prev, ...data.products]);
//       setPage((prev) => prev + 1);

//       // Usually your response will tell you if there is no more data.
//       if (data.products.length < 3) {
//         setHasMore(false);
//       }
//       setLoading(false);
//     }, 800);
//   };
//   return (
//     <div className="max-h-[300px] w-full  overflow-y-auto px-10">
//       <div className="flex w-full flex-col items-center  gap-3">
//         {products.map((product) => (
//           <Product key={product.id} product={product} />
//         ))}
//         <InfiniteScroll hasMore={hasMore} isLoading={loading} next={next} threshold={1}>
//           {hasMore && <Loader2 className="my-4 h-8 w-8 animate-spin" />}
//         </InfiniteScroll>
//       </div>
//     </div>
//   );
// };

// export default InfiniteScrollDemo;

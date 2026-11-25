import './ProductMark.css';

/** A product's own identity: its logo where one exists, otherwise its wordmark
 *  in the product's accent. Used inside the product's heading, so the heading
 *  still reads as the product name. */
export default function ProductMark({ name, logo, size = 'md' }: { name: string; logo?: string; size?: 'md' | 'lg' }) {
  if (logo) {
    return <img src={logo} alt={name} className={`product-mark product-mark--logo product-mark--${size}`} width={196} height={60} />;
  }
  return (
    <span className={`product-mark product-mark--word product-mark--${size} product-mark--${name.toLowerCase()}`}>{name}</span>
  );
}

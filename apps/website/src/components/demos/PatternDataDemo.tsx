import { Input, Spinner, Table, type TableColumn, type TableRow } from '@ghds/react';
import { useState } from 'react';

interface Product extends TableRow {
  name: string;
  price: number;
  stock: string;
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Wireless Mouse', price: 29.99, stock: 'In stock' },
  { id: '2', name: 'USB-C Hub', price: 49.99, stock: 'Low stock' },
  { id: '3', name: 'Mechanical Keyboard', price: 89.99, stock: 'In stock' },
  { id: '4', name: 'Webcam HD', price: 59.99, stock: 'Out of stock' },
  { id: '5', name: 'Monitor Stand', price: 39.99, stock: 'In stock' },
];

const COLUMNS: TableColumn<Product>[] = [
  { key: 'name', header: 'Name', sortable: true },
  {
    key: 'price',
    header: 'Price',
    sortable: true,
    render: (row) => `$${row.price.toFixed(2)}`,
  },
  { key: 'stock', header: 'Stock', sortable: true },
];

/** Live demo of data patterns — searchable product table with loading simulation. */
export default function PatternDataDemo(): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const handleSearch = (value: string) => {
    setQuery(value);
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="demo-stack" style={{ gap: 'var(--sys-spacing-md, 16px)' }}>
      <Input
        placeholder="Search products..."
        value={query}
        onChange={(e) => handleSearch((e.target as HTMLInputElement).value)}
      />
      {loading ? (
        <div
          style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sys-spacing-lg)' }}
        >
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--sys-spacing-xl)',
            color: 'var(--comp-input-text, inherit)',
          }}
        >
          <p>No results for "{query}".</p>
          <p style={{ fontSize: 'var(--sys-typography-caption-fontSize, 0.875rem)' }}>
            Try a different search term.
          </p>
        </div>
      ) : (
        <Table columns={COLUMNS} rows={filtered} />
      )}
    </div>
  );
}

import { Pagination } from '@ghds/react';
import { useState } from 'react';

/** Live, interactive pagination demo (React). */
export default function PaginationDemo(): React.JSX.Element {
  const [page, setPage] = useState(3);
  return <Pagination count={12} page={page} onPageChange={setPage} />;
}

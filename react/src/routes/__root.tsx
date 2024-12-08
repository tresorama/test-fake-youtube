import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { HomeIcon } from 'lucide-react';

export const Route = createRootRoute({
  component: () => (
    <main className='w-full h-screen flex flex-col'>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          <HomeIcon />
        </Link>{' '}
      </div>
      <hr />
      <div className='flex-1 overflow-y-auto'>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </main>
  ),
});
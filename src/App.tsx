import {
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';

import { Home } from './pages/Home';
import { Historia } from './pages/Historia';
import { Colecoes } from './pages/Colecoes';
import { Admin } from './pages/Admin';
import { PlaylistWelcome } from './components/PlaylistWelcome';
import { Caderno } from './pages/Caderno';
import { ResetPassword } from './pages/ResetPassword';
import { recoverySnapshot, subscribeRecovery } from './lib/passwordRecovery';


export default function App() {
  const recovery = useSyncExternalStore(subscribeRecovery, recoverySnapshot);
  const [path, setPath] = useState(
    `${window.location.pathname}${window.location.search}`
  );

  useEffect(() => {
    const handlePopState = () => {
      setPath(
        `${window.location.pathname}${window.location.search}`
      );
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);

  const pathname =
    path.split('?')[0];

    let page;

  const showRecovery = pathname === '/redefinir-senha' || (recovery !== 'idle');

  if (showRecovery) {
    page = <ResetPassword />;
  } else if (pathname === '/historia') {
    page = <Historia />;
  } else if (pathname === '/caderno') {
    page = <Caderno />;
  } else if (pathname === '/colecoes') {
    page = <Colecoes key={path} />;
  } else if (pathname === '/admin') {
    page = <Admin />;
  } else {
    page = <Home />;
  }

  return (
    <>
      {page}

      {pathname !== '/admin' && !showRecovery && (
        <PlaylistWelcome />
      )}
    </>
  );
}

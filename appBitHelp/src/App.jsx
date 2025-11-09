import { CssBaseline} from "@mui/material";
import { Layout } from "./components/Layout/Layout";
import { Outlet } from 'react-router-dom';

//El tema es definido en el layout utilizando Toolpad.
export default function App() { 

  return ( 
    <>
        <CssBaseline enableColorScheme /> 
        <Layout> 
          <Outlet /> 
        </Layout> 
    </>
  ); 
}
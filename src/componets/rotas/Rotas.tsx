import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from "../../pages/home/Home.tsx"
import Detalhes from '../../pages/detalhes/Detalhes.tsx'
import Adicionar from '../../pages/adicionar/Adicionar.tsx'


function Rotas(){
    return(
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/:placa" element={<Detalhes /> }/>  
                    <Route path="/adicionar" element={<Adicionar /> }/>  

                </Routes>
            </BrowserRouter>
        </>
    )   
}

export default Rotas
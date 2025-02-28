import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from "../../pages/home/Home.jsx"
import Detalhes from '../../pages/detalhes/detalhes.jsx'
import Adicionar from '../../pages/adicionar/Adicionar.jsx'


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
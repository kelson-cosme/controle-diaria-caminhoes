import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from "../../pages/home/Home.jsx"
function Rotas(){
    return(
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                </Routes>
            </BrowserRouter>
        </>
    )   
}

export default Rotas
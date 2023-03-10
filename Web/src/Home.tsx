import { Header } from './components/Home/Header';
import { Main } from './components/Home/Main';
import { Footer} from './components/Home/Footer';
import './style/global.css'

export function Home() {
  return (
    <div className="bg-cyan-900 text-white uppercase box-border w-full h-screen flex flex-col items-center justify-between">
      <Header/>
      <Main/>
      <Footer/>
    </div>
  )
}

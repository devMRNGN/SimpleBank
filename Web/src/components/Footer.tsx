import { useState, useEffect } from "react"

export function Footer(){
   const timeElapsed = Date.now();
   const [today, setToday] = useState<String>();
   useEffect(() => {
      setToday(new Date(timeElapsed).toLocaleDateString())
   },[]);
   return(
      <footer className="text-center">
         <blockquote title="Reserved rights">
            Reserved rights © <br/>
            { today }
         </blockquote>
      </footer>
   )
}
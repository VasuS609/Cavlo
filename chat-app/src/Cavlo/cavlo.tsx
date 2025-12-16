import { Header, Body, Footer } from "../VideoComponents";


export default function Cavlo() {


  return (
    <div>
      <Header />
      <div className="pt-20 px-4">
      
        <Body />  // this is calllign to vidcomponents body
      </div>
      <Footer />
    </div>
  );
}
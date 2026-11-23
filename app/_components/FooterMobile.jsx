import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faShoppingCart,
  faUser,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function FooterMobile() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg py-2 px-3 flex justify-around items-center border-t border-slate-200/80">
      <Link href="/comming-soon" className="flex flex-col items-center group py-1 px-2 rounded-xl transition-all duration-150 hover:bg-teal-50">
        <FontAwesomeIcon
          icon={faShoppingCart}
          className="text-base text-slate-500 group-hover:text-teal-700 transition-colors"
        />
        <span className="text-[11px] font-medium text-slate-600 group-hover:text-teal-800 mt-1">Keranjang</span>
      </Link>
      <Link href="/home" className="flex flex-col items-center group py-1 px-2 rounded-xl transition-all duration-150 hover:bg-teal-50">
        <FontAwesomeIcon 
          icon={faHome} 
          className="text-base text-teal-700 group-hover:text-teal-800 transition-colors" 
        />
        <span className="text-[11px] font-semibold text-teal-800 mt-1">Home</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center group py-1 px-2 rounded-xl transition-all duration-150 hover:bg-teal-50">
        <FontAwesomeIcon
          icon={faCog}
          className="text-base text-slate-500 group-hover:text-teal-700 transition-colors"
        />
        <span className="text-[11px] font-medium text-slate-600 group-hover:text-teal-800 mt-1">Pengaturan</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center group py-1 px-2 rounded-xl transition-all duration-150 hover:bg-teal-50">
        <FontAwesomeIcon
          icon={faUser}
          className="text-base text-slate-500 group-hover:text-teal-700 transition-colors"
        />
        <span className="text-[11px] font-medium text-slate-600 group-hover:text-teal-800 mt-1">Profile</span>
      </Link>
    </div>
  );
}

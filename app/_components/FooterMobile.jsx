import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faShoppingCart,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

export default function FooterMobile() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-2 flex justify-around items-center border-t border-gray-200 mt-10">
      <Link href="/home">
        <div className="flex flex-col items-center">
          <FontAwesomeIcon icon={faHome} size="lg" className="text-blue-500" />
          <span className="text-xs font-normal text-gray-700">Home</span>
        </div>
      </Link>
      <Link href="/comming-soon">
        <div className="flex flex-col items-center">
          <FontAwesomeIcon
            icon={faShoppingCart}
            size="lg"
            className="text-green-500"
          />
          <span className="text-xs font-normal text-gray-700">Keranjang</span>
        </div>
      </Link>
      <Link href="/profile">
        <div className="flex flex-col items-center">
          <FontAwesomeIcon
            icon={faUser}
            size="lg"
            className="text-purple-500"
          />
          <span className="text-xs font-normal text-gray-700">Profile</span>
        </div>
      </Link>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href={"/"}>
      <div className="flex items-center gap-x-2 cursor-pointer">
        <Image src={"/logo.png"} alt="Logo" width={25} height={25} />
        <div className="text-xl font-bold">Kwitch</div>
      </div>
    </Link>
  );
}

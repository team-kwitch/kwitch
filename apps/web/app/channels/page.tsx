import Image from "next/image";

export default function ChannelsPage() {
  return (
    <div className="flex-1 flex flex-col gap-y-3 items-center justify-center">
      <Image src={"/logo.png"} alt="Logo" width={100} height={100} />
      <p className="text-center font-bold">Pick a Channel!</p>
    </div>
  );
}

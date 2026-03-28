import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full mt-auto bg-black flex justify-center items-center">
      <Image
        src="/images/backgrounds/footer.png"
        height={1080}
        width={1920}
        alt="Footer Background"
        className="w-full h-auto object-cover pointer-events-none select-none max-w-full"
      />
    </footer>
  );
}

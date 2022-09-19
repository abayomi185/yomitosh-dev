function Header() {
  return (
    <header className="container flex text-center mx-auto pt-10 pb-2">
      <div className="md:w-4/6 mx-auto">
        <img src="/yomi.jpg" className="h-24 rounded-full mx-auto mb-5" />
        <h1 className="font-bold">Abayomi O-Ikuru</h1>
        <p>
          Artificial Intelligence MSc with
          <br />
          Electronic Engineering background.
          <br /> Loves Software Eng. and DevOps.
        </p>
      </div>
    </header>
  );
}

export default Header;

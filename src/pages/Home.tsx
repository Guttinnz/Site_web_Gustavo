import { About } from '../sections/About';
import { Career } from '../sections/Career';
import { Hero } from '../sections/Hero';
import { Impact } from '../sections/Impact';
import { Recommendations } from '../sections/Recommendations';
import { Services } from '../sections/Services';
import { Work } from '../sections/Work';

export function Home() {
  return (
    <>
      <Hero />
      <Impact />
      <Work />
      <Career />
      <About />
      <Services />
      <Recommendations />
    </>
  );
}

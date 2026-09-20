import type { Metadata } from "next";
import Download04Icon from "@hugeicons/core-free-icons/Download04Icon";
import { HugeiconsIcon } from "@hugeicons/react";

import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Regulamin",
  description: "Regulamin XL Bachanaliów Fantastycznych 2026.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/regulamin/`,
  },
};

export default function RegulationsPage() {
  return (
    <article className="gutter mx-auto max-w-6xl pt-12 pb-4 sm:pt-16">
      <SectionHeading as="h1" size="page">
        Regulamin
      </SectionHeading>

      <div className="wp-content mt-10">
        <header className="mb-10 max-w-[70ch] text-center">
          <p>
            <strong>REGULAMIN OGÓLNOPOLSKIEGO FESTIWALU MIŁOŚNIKÓW FANTASTYKI</strong>
            <br />
            <strong>XL BACHANALIA FANTASTYCZNE 2026</strong>
          </p>
        </header>

        <ol className="[&>li+li]:mt-4">
          <li>
            Bachanalia Fantastyczne to festiwal miłośników literatury, fantastyki oraz gier
            organizowany przez Zielonogórski Klub Fantastyki “Ad Astra”.
          </li>
          <li>
            Każdy uczestnik konwentu Bachanalia Fantastyczne (zwanego dalej Bachanaliami)
            rejestrując się jako uczestnik akceptuje niniejszy regulamin i zobowiązuje się
            jednocześnie przestrzegać jego warunków.
          </li>
          <li>
            Ponadto uczestnik wyraża zgodę na przetwarzanie, przechowywanie danych osobowych na
            potrzeby organizacji imprezy, a także czynności związanych z rozliczeniem imprezy z
            organami publicznymi, do celów statystycznych oraz bezpieczeństwa.
          </li>
          <li>
            Administratorem danych osobowych jest Zielonogórski Klub Fantastyki Ad Astra
            zarejestrowany w Sądzie Okręgowym – Zielona Góra KRS: 0000170986 z siedzibą w Zielonej
            Górze ul. Fabryczna 13 B.
          </li>
          <li>
            Każdemu uczestnikowi przysługuje prawo do usunięcia oraz edycji swoich danych osobowych.
          </li>
          <li>
            Wszystkie osoby uczestniczące w Bachanaliach mają obowiązek zapoznać się, zaakceptować i
            przestrzegać treści niniejszego regulaminu.
          </li>
          <li>
            Osoby nie przestrzegające regulaminu mogą zostać usunięte z terenu konwentu bez zwrotu
            jakichkolwiek kosztów. Nieznajomość regulaminu nie zwalnia z ponoszenia ewentualnych
            konsekwencji wyciągniętych wskutek jego nieprzestrzegania.
          </li>
          <li>
            Regulamin dostępny będzie:
            <ul>
              <li>na stronie internetowej www.facebook.com/BachanaliaFantastyczne</li>
              <li>w punkcie informacyjnym na terenie Bachanaliów.</li>
            </ul>
          </li>
          <li>
            Bachanalia odbywają się na terenie Uniwersytetu Zielonogórskiego campusu B ul. Wojska
            Polskiego 69, 71 i 71A, Zielona Góra (inaczej UZ).
          </li>
          <li>
            Na terenie Bachanaliów uczestnicy mogą przebywać w godzinach trwania punktów programu.
          </li>
          <li>
            Na terenie Bachanaliów mogą przebywać jedynie osoby posiadające akredytację do tego
            uprawniającą. Akredytację uzyskać można w punkcie rejestracji przy wejściu do budynku
            konwentowego, niezwłocznie po dotarciu na teren Bachanaliów. Możliwa jest również
            wcześniejsza akredytacja poprzez stronę internetową Organizatora
            bachanaliafantastyczne.pl. Rejestracja poprzez stronę internetową nie zwalnia z
            obowiązku udania się do punktu rejestracji w momencie przybycia na Bachanalia. W
            punktach programu mogą brać udział jedynie osoby zaakredytowane.
            <p>Osoby upoważnione do otrzymania bezpłatnej akredytacji:</p>
            <ul>
              <li>dzieci do 12 roku życia włącznie</li>
              <li>
                studenci Uniwersytetu Zielonogórskiego za okazaniem ważnej legitymacji studenckiej
              </li>
              <li>pracownicy Uniwersytetu Zielonogórskiego</li>
            </ul>
          </li>
          <li>
            W przypadku, gdy Uczestnikiem Bachanaliów jest małoletni w wieku poniżej 16 roku życia,
            może on uczestniczyć w Bachanaliach wyłącznie pod opieką opiekuna prawnego lub osoby
            upoważnionej na piśmie przez opiekuna prawnego, która przy pierwszym wejściu na
            Bachanalia w punkcie informacyjnym okaże deklarację o odpowiedzialności za osobę
            małoletnią (załącznik nr 1). Osoba dorosła może być opiekunem maksymalnie pięciu
            małoletnich osób uczestniczących w Imprezie. Nie dotyczy to grup zorganizowanych.
          </li>
          <li>
            Osoba niepełnosprawna, która zarejestruje chęć udziału w imprezie, powinna poinformować
            organizatora, jeśli ten miałby przygotować udogodnienia umożliwiające jej komfortowe
            korzystanie z atrakcji podczas trwania Bachanaliów. Taka informacja musi zostać
            dostarczona do Organizatora najpóźniej na 14 dni przed startem Bachanaliów na maila
            org@bachanaliafamtastyczne.pl
          </li>
          <li>
            Każdy uczestnik zobowiązany jest nosić identyfikator. Zdjęcie lub uszkodzenie
            identyfikatora może skutkować niewpuszczeniem na teren imprezy lub usunięciem z niej. W
            razie uszkodzenia lub zagubienia identyfikatora należy zgłosić się do punktu rejestracji
            w celu wydania nowego.
          </li>
          <li>
            Każda osoba przebywająca na terenie Bachanaliów ma obowiązek okazać identyfikator na
            żądanie, w celu weryfikacji jej uprawnień przez Organizatora.
          </li>
          <li>
            Osobom nieposiadającym identyfikatora służby porządkowe wskażą najkrótszą drogę do
            wyjścia.
          </li>
          <li>
            Organizatorzy nie odpowiadają za szkody zdrowotne i moralne uczestników imprezy;
            ubezpieczenie od następstw nieszczęśliwych wypadków każdy uczestnik winien wykupić
            samodzielnie przed rozpoczęciem konwentu.
          </li>
          <li>
            Na terenie Bachanaliów znajdować się będą medycy udzielający pomocy przedmedycznej w
            zakresie przysługujących im kompetencji zawodowych.
          </li>
          <li>
            Organizator nie ponosi odpowiedzialności za rzeczy pozostawione bez opieki lub
            zagubione.
          </li>
          <li>
            Zabronione jest wnoszenie na teren Bachanaliów:
            <ul>
              <li>broni w rozumieniu obowiązującej Ustawy o Broni i Amunicji;</li>
              <li>
                przedmiotów niebezpiecznych (w tym zabawek ASG, EAG, markerów paintball i innych),
              </li>
              <li>amunicji do wyżej wymienionych;</li>
              <li>broni białej (z wyjątkiem małych noży oraz tzw. larpowej broni bezpiecznej);</li>
              <li>broni treningowej (bokkenów, palcatów itp.);</li>
              <li>materiałów wybuchowych;</li>
              <li>substancji toksycznych, cuchnących lub łatwopalnych;</li>
              <li>środków odurzających;</li>
              <li>
                innych przedmiotów, których posiadanie jest zabronione bezwzględnie obowiązującymi
                przepisami prawa.
              </li>
            </ul>
          </li>
          <li>
            Przedmioty wymienione w pkt.20 wolno wnosić wyłącznie po uzyskaniu pisemnej zgody
            Koordynatora konwentu, jeśli są niezbędne do przeprowadzenia punktu programu. Zgoda
            wyrażona w formie innej niż pisemna jest nieważna.
          </li>
          <li>
            Repliki broni oraz zabawki (ASG, AEG), a także markery paintball wolno wnosić na teren
            imprezy, jeśli mają:
            <ul>
              <li>rozłączone napędy (odłączone akumulatory, puste zasobniki gazu),</li>
              <li>zwolnione sprężyny,</li>
              <li>puste magazynki i komory nabojowe,</li>
              <li>bezpieczniki ustawione w pozycji bezpiecznej.</li>
            </ul>
            <p>
              Powyższe właściwości tych przedmiotów należy utrzymywać przez cały czas trwania
              konwentu.
            </p>
          </li>
          <li>
            Podczas trwania Bachanaliów zabronione jest kierowanie broni, jej replik lub zabawek ją
            przypominających czy jakiegokolwiek niebezpiecznego narzędzia w stronę innego uczestnika
            z wyjątkiem sytuacji, gdy udzielił na to wyraźną zgodę Koordynator (np. podczas
            pozowania do zdjęć, czy gier typu larp).
          </li>
          <li>
            Uczestnicy Bachanaliów są zobowiązani do zachowania czystości i porządku na jego terenie
            oraz na terenie znajdującym się dookoła obiektów.
          </li>
          <li>
            Na terenie Bachanaliów obowiązuje całkowity zakaz palenia. Palenie dozwolone jest poza
            terenem obiektu lub w miejscach do tego wyznaczonych przez Organizatorów.
          </li>
          <li>
            Na terenie Bachanaliów obowiązuje bezwzględny zakaz posiadania i zażywania środków
            psychotropowych, psychoaktywnych oraz odurzających – w przypadku odnalezienia u
            uczestnika ww. środków, nastąpi dyscyplinarne usunięcie go z terenu konwentu. W każdym
            takim przypadku może zostać wezwana Policja.
          </li>
          <li>
            Na terenie Bachanaliów obowiązuje zakaz spożywania alkoholu poza miejscami do tego
            wyznaczonymi przez Organizatorów.
          </li>
          <li>
            Każdy uczestnik Bachanaliów zobowiązany jest do kulturalnego zachowania i
            podporządkowania się decyzjom Organizatorów. Zastrzeżenia do decyzji Organizatorów można
            zgłaszać Koordynatorom konwentu – ich decyzja jest ostateczna. W przypadku konfliktu
            pomiędzy uczestnikami organem rozstrzygającym jest Koordynator Główny, a jego decyzja
            jest ostateczna.
          </li>
          <li>
            Uczestnicy oraz wszystkie inne osoby, które znajdują się na terenie Bachanaliów
            zobowiązane są stosować się do poleceń służb porządkowych i organizatorów.
          </li>
          <li>
            Uczestnicy i obsługa Bachanaliów mogą poruszać się jedynie w ramach wyznaczonych przez
            Organizatora pomieszczeń.
          </li>
          <li>
            Organizator nie ponosi odpowiedzialności za szkody poczynione przez uczestników
            Bachanaliów. Za wszelkie szkody odpowiedzialność (w tym finansową oraz karną) ponoszą
            sprawcy.
          </li>
          <li>
            Zabrania się prowadzenia bez autoryzacji Organizatora jakiejkolwiek działalności
            handlowej lub innej zarobkowej, a także działalności reklamowej oraz promocyjnej na
            terenie Bachanaliów.
          </li>
          <li>
            Wszystkie materiały reklamowe, których obecność na konwencie nie została uzgodniona z
            Organizatorem konwentu, zostaną z terenu imprezy usunięte wraz z rozprowadzającymi je
            osobami. Osoby te zostaną obciążone kosztem naprawienia ewentualnych szkód powstałych w
            wyniku ich działania.
          </li>
          <li>
            Osoby prowadzące punkty programu (zwane dalej Prelegentami) zobowiązane są do oddania
            sali prelekcyjnej w stanie, w jakim została im wydana. W przypadku uszkodzeń sali
            stwierdzonych podczas jej wydawania lub użytkowania, Prelegenci zobowiązani powiadomić o
            tym Organizatorów.
          </li>
          <li>
            Prelegenci nie mogą samodzielnie aranżować sal, a także dokonywać jakichkolwiek zmian w
            ustawieniu sprzętu technicznego bez porozumienia z Organizatorami.
          </li>
          <li>
            Nagrodami w konkursach są bony z walutą konwentową (zwane „Bachelami”) podlegające
            wymianie na nagrody w stoisku z nagrodami – sklepiku konwentowym. Za niewykorzystaną
            walutę konwentową nie przewiduje się rekompensaty.
          </li>
          <li>
            Członkowie rzeczywiści Zielonogórskiego Klubu Fantastyki “Ad Astra” (organizator) nie
            mogą brać udziału w punktach programu, w czasie których uczestnicy mogą otrzymać od
            prowadzącego dany punkt walutę konwentową “Bachele”..
          </li>
          <li>
            Na terenie Bachanaliów zabrania się rozpowszechniania utworów chronionych prawami
            autorskimi, w sposób, który te prawa narusza.
          </li>
          <li>
            Organizator nie ponosi odpowiedzialności i nie utożsamia się z opiniami wygłaszanymi
            przez uczestników (w tym Prelegentów) podczas trwania konwentu.
          </li>
          <li>
            Na terenie Bachanaliów obowiązuje bezwzględny zakaz prowadzenia działalności
            politycznej, w szczególności kampanii wyborczych i agitacji politycznej. Osoby, które
            nie będą przestrzegać tego zakazu, mogą zostać usunięte z terenu konwentu.
          </li>
          <li>
            Każdy uczestnik zobowiązany jest do traktowania pozostałych uczestników z szacunkiem.
            Nękanie fizyczne lub słowne może skutkować usunięciem z konwentu i zgłoszeniem do
            odpowiednich służb.
          </li>
          <li>
            Zapisując się do udziału w konwencie uczestnik dobrowolnie wyraża zgodę na nieodpłatne
            wykorzystanie jego wizerunku utrwalonego w formie fotografii lub zapisu wideo oraz
            udziela organizatorowi konwentu nieodpłatnej licencji na wykorzystanie go na wszystkich
            polach eksploatacji, w tym: utrwalania i rozpowszechniania w dowolnej formie oraz
            wprowadzanie do pamięci komputera, wykorzystania do promocji i organizacji imprez
            organizowanych przez Zielonogórski Klub Fantastyki AD ASTRA, zamieszczania i
            publikowania na promocyjnych materiałach drukowanych organizatora, w prasie, na stronach
            internetowych oraz w przekazach telewizyjnych i radiowych.
          </li>
          <li>
            Uczestnikowi przysługuje prawo cofnięcia zgody opisanej w pkt. 36. Cofnięcie zgody
            odbywa się poprzez wysłanie do organizatora stosownej informacji na adres
            org@bachanalia.zgora.pl
          </li>
          <li>
            Wszelkie reklamacje można składać w formie pisemnej najpóźniej w terminie 14 dni od dnia
            zakończenia Bachanaliów na następujący adres korespondencyjny Organizatora:
            Zielonogórski Klub Fantastyki “Ad Astra”, ul. Fabryczna 13b, 65-410 Zielona Góra lub na
            adres mailowy zkf@adastra.zgora.pl, w obu wypadkach z dopiskiem Reklamacja – Bachanalia
            Fantastyczne.
          </li>
          <li>Organizator nie ponosi odpowiedzialności za skutki działania siły wyższej.</li>
          <li>
            W kwestiach nieuregulowanych powyższym regulaminem, zastosowanie mają odpowiednie
            przepisy Prawa Cywilnego, Karnego lub Karno-Skarbowego obowiązujące na terenie RP.
          </li>
          <li>
            Organizatorowi przysługuje prawo zmiany niniejszego Regulaminu, w szczególności z uwagi
            na potrzebę zapewnienia prawidłowego przebiegu Bachanaliów oraz bezpieczeństwa
            Uczestnikom.
          </li>
        </ol>
      </div>

      <section className="mt-12 border-t border-hairline py-8 sm:flex sm:items-start sm:justify-between sm:gap-12 sm:py-10">
        <div>
          <h2 className="display text-[clamp(1.55rem,3.4vw,2rem)]">Załącznik nr 1</h2>
          <p className="mt-3 max-w-[58ch] text-sm/relaxed text-ink-muted">
            Oświadczenie opiekuna prawnego uczestnika poniżej 16 roku życia, do pobrania,
            wydrukowania i podpisania.
          </p>
        </div>
        <a
          className="marked-link relative mt-5 flex max-w-full shrink-0 items-start gap-2 before:absolute before:-inset-2 sm:mt-2"
          download
          href="/zgoda_opiekuna_bf26.pdf"
        >
          <HugeiconsIcon
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0"
            icon={Download04Icon}
            strokeWidth={2}
          />
          <span>Pobierz oświadczenie (PDF)</span>
        </a>
      </section>
    </article>
  );
}

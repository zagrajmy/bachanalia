export interface RegulationRule {
  after?: string;
  items?: readonly string[];
  listLead?: string;
  text: string;
}

export interface RegulationSection {
  end: number;
  id: string;
  rules: readonly RegulationRule[];
  start: number;
  title: string;
}

export const REGULATIONS_TITLE =
  "Regulamin Ogólnopolskiego Festiwalu Miłośników Fantastyki XL Bachanalia Fantastyczne 2026";

const RULES: readonly RegulationRule[] = [
  {
    text: "Bachanalia Fantastyczne to festiwal miłośników literatury, fantastyki oraz gier organizowany przez Zielonogórski Klub Fantastyki “Ad Astra”.",
  },
  {
    text: "Każdy uczestnik konwentu Bachanalia Fantastyczne (zwanego dalej Bachanaliami) rejestrując się jako uczestnik akceptuje niniejszy regulamin i zobowiązuje się jednocześnie przestrzegać jego warunków.",
  },
  {
    text: "Ponadto uczestnik wyraża zgodę na przetwarzanie, przechowywanie danych osobowych na potrzeby organizacji imprezy, a także czynności związanych z rozliczeniem imprezy z organami publicznymi, do celów statystycznych oraz bezpieczeństwa.",
  },
  {
    text: "Administratorem danych osobowych jest Zielonogórski Klub Fantastyki Ad Astra zarejestrowany w Sądzie Okręgowym – Zielona Góra KRS: 0000170986 z siedzibą w Zielonej Górze ul. Fabryczna 13 B.",
  },
  {
    text: "Każdemu uczestnikowi przysługuje prawo do usunięcia oraz edycji swoich danych osobowych.",
  },
  {
    text: "Wszystkie osoby uczestniczące w Bachanaliach mają obowiązek zapoznać się, zaakceptować i przestrzegać treści niniejszego regulaminu.",
  },
  {
    text: "Osoby nie przestrzegające regulaminu mogą zostać usunięte z terenu konwentu bez zwrotu jakichkolwiek kosztów. Nieznajomość regulaminu nie zwalnia z ponoszenia ewentualnych konsekwencji wyciągniętych wskutek jego nieprzestrzegania.",
  },
  {
    text: "Regulamin dostępny będzie:",
    items: [
      "na stronie internetowej www.facebook.com/BachanaliaFantastyczne",
      "w punkcie informacyjnym na terenie Bachanaliów.",
    ],
  },
  {
    text: "Bachanalia odbywają się na terenie Uniwersytetu Zielonogórskiego campusu B ul. Wojska Polskiego 69, 71 i 71A, Zielona Góra (inaczej UZ).",
  },
  {
    text: "Na terenie Bachanaliów uczestnicy mogą przebywać w godzinach trwania punktów programu.",
  },
  {
    text: "Na terenie Bachanaliów mogą przebywać jedynie osoby posiadające akredytację do tego uprawniającą. Akredytację uzyskać można w punkcie rejestracji przy wejściu do budynku konwentowego, niezwłocznie po dotarciu na teren Bachanaliów. Możliwa jest również wcześniejsza akredytacja poprzez stronę internetową Organizatora bachanaliafantastyczne.pl. Rejestracja poprzez stronę internetową nie zwalnia z obowiązku udania się do punktu rejestracji w momencie przybycia na Bachanalia. W punktach programu mogą brać udział jedynie osoby zaakredytowane.",
    listLead: "Osoby upoważnione do otrzymania bezpłatnej akredytacji:",
    items: [
      "dzieci do 12 roku życia włącznie",
      "studenci Uniwersytetu Zielonogórskiego za okazaniem ważnej legitymacji studenckiej",
      "pracownicy Uniwersytetu Zielonogórskiego",
    ],
  },
  {
    text: "W przypadku, gdy Uczestnikiem Bachanaliów jest małoletni w wieku poniżej 16 roku życia, może on uczestniczyć w Bachanaliach wyłącznie pod opieką opiekuna prawnego lub osoby upoważnionej na piśmie przez opiekuna prawnego, która przy pierwszym wejściu na Bachanalia w punkcie informacyjnym okaże deklarację o odpowiedzialności za osobę małoletnią (załącznik nr 1). Osoba dorosła może być opiekunem maksymalnie pięciu małoletnich osób uczestniczących w Imprezie. Nie dotyczy to grup zorganizowanych.",
  },
  {
    text: "Osoba niepełnosprawna, która zarejestruje chęć udziału w imprezie, powinna poinformować organizatora, jeśli ten miałby przygotować udogodnienia umożliwiające jej komfortowe korzystanie z atrakcji podczas trwania Bachanaliów. Taka informacja musi zostać dostarczona do Organizatora najpóźniej na 14 dni przed startem Bachanaliów na maila org@bachanaliafamtastyczne.pl",
  },
  {
    text: "Każdy uczestnik zobowiązany jest nosić identyfikator. Zdjęcie lub uszkodzenie identyfikatora może skutkować niewpuszczeniem na teren imprezy lub usunięciem z niej. W razie uszkodzenia lub zagubienia identyfikatora należy zgłosić się do punktu rejestracji w celu wydania nowego.",
  },
  {
    text: "Każda osoba przebywająca na terenie Bachanaliów ma obowiązek okazać identyfikator na żądanie, w celu weryfikacji jej uprawnień przez Organizatora.",
  },
  {
    text: "Osobom nieposiadającym identyfikatora służby porządkowe wskażą najkrótszą drogę do wyjścia.",
  },
  {
    text: "Organizatorzy nie odpowiadają za szkody zdrowotne i moralne uczestników imprezy; ubezpieczenie od następstw nieszczęśliwych wypadków każdy uczestnik winien wykupić samodzielnie przed rozpoczęciem konwentu.",
  },
  {
    text: "Na terenie Bachanaliów znajdować się będą medycy udzielający pomocy przedmedycznej w zakresie przysługujących im kompetencji zawodowych.",
  },
  {
    text: "Organizator nie ponosi odpowiedzialności za rzeczy pozostawione bez opieki lub zagubione.",
  },
  {
    text: "Zabronione jest wnoszenie na teren Bachanaliów:",
    items: [
      "broni w rozumieniu obowiązującej Ustawy o Broni i Amunicji;",
      "przedmiotów niebezpiecznych (w tym zabawek ASG, EAG, markerów paintball i innych),",
      "amunicji do wyżej wymienionych;",
      "broni białej (z wyjątkiem małych noży oraz tzw. larpowej broni bezpiecznej);",
      "broni treningowej (bokkenów, palcatów itp.);",
      "materiałów wybuchowych;",
      "substancji toksycznych, cuchnących lub łatwopalnych;",
      "środków odurzających;",
      "innych przedmiotów, których posiadanie jest zabronione bezwzględnie obowiązującymi przepisami prawa.",
    ],
  },
  {
    text: "Przedmioty wymienione w pkt.20 wolno wnosić wyłącznie po uzyskaniu pisemnej zgody Koordynatora konwentu, jeśli są niezbędne do przeprowadzenia punktu programu. Zgoda wyrażona w formie innej niż pisemna jest nieważna.",
  },
  {
    text: "Repliki broni oraz zabawki (ASG, AEG), a także markery paintball wolno wnosić na teren imprezy, jeśli mają:",
    items: [
      "rozłączone napędy (odłączone akumulatory, puste zasobniki gazu),",
      "zwolnione sprężyny,",
      "puste magazynki i komory nabojowe,",
      "bezpieczniki ustawione w pozycji bezpiecznej.",
    ],
    after:
      "Powyższe właściwości tych przedmiotów należy utrzymywać przez cały czas trwania konwentu.",
  },
  {
    text: "Podczas trwania Bachanaliów zabronione jest kierowanie broni, jej replik lub zabawek ją przypominających czy jakiegokolwiek niebezpiecznego narzędzia w stronę innego uczestnika z wyjątkiem sytuacji, gdy udzielił na to wyraźną zgodę Koordynator (np. podczas pozowania do zdjęć, czy gier typu larp).",
  },
  {
    text: "Uczestnicy Bachanaliów są zobowiązani do zachowania czystości i porządku na jego terenie oraz na terenie znajdującym się dookoła obiektów.",
  },
  {
    text: "Na terenie Bachanaliów obowiązuje całkowity zakaz palenia. Palenie dozwolone jest poza terenem obiektu lub w miejscach do tego wyznaczonych przez Organizatorów.",
  },
  {
    text: "Na terenie Bachanaliów obowiązuje bezwzględny zakaz posiadania i zażywania środków psychotropowych, psychoaktywnych oraz odurzających – w przypadku odnalezienia u uczestnika ww. środków, nastąpi dyscyplinarne usunięcie go z terenu konwentu. W każdym takim przypadku może zostać wezwana Policja.",
  },
  {
    text: "Na terenie Bachanaliów obowiązuje zakaz spożywania alkoholu poza miejscami do tego wyznaczonymi przez Organizatorów.",
  },
  {
    text: "Każdy uczestnik Bachanaliów zobowiązany jest do kulturalnego zachowania i podporządkowania się decyzjom Organizatorów. Zastrzeżenia do decyzji Organizatorów można zgłaszać Koordynatorom konwentu – ich decyzja jest ostateczna. W przypadku konfliktu pomiędzy uczestnikami organem rozstrzygającym jest Koordynator Główny, a jego decyzja jest ostateczna.",
  },
  {
    text: "Uczestnicy oraz wszystkie inne osoby, które znajdują się na terenie Bachanaliów zobowiązane są stosować się do poleceń służb porządkowych i organizatorów.",
  },
  {
    text: "Uczestnicy i obsługa Bachanaliów mogą poruszać się jedynie w ramach wyznaczonych przez Organizatora pomieszczeń.",
  },
  {
    text: "Organizator nie ponosi odpowiedzialności za szkody poczynione przez uczestników Bachanaliów. Za wszelkie szkody odpowiedzialność (w tym finansową oraz karną) ponoszą sprawcy.",
  },
  {
    text: "Zabrania się prowadzenia bez autoryzacji Organizatora jakiejkolwiek działalności handlowej lub innej zarobkowej, a także działalności reklamowej oraz promocyjnej na terenie Bachanaliów.",
  },
  {
    text: "Wszystkie materiały reklamowe, których obecność na konwencie nie została uzgodniona z Organizatorem konwentu, zostaną z terenu imprezy usunięte wraz z rozprowadzającymi je osobami. Osoby te zostaną obciążone kosztem naprawienia ewentualnych szkód powstałych w wyniku ich działania.",
  },
  {
    text: "Osoby prowadzące punkty programu (zwane dalej Prelegentami) zobowiązane są do oddania sali prelekcyjnej w stanie, w jakim została im wydana. W przypadku uszkodzeń sali stwierdzonych podczas jej wydawania lub użytkowania, Prelegenci zobowiązani powiadomić o tym Organizatorów.",
  },
  {
    text: "Prelegenci nie mogą samodzielnie aranżować sal, a także dokonywać jakichkolwiek zmian w ustawieniu sprzętu technicznego bez porozumienia z Organizatorami.",
  },
  {
    text: "Nagrodami w konkursach są bony z walutą konwentową (zwane „Bachelami”) podlegające wymianie na nagrody w stoisku z nagrodami – sklepiku konwentowym. Za niewykorzystaną walutę konwentową nie przewiduje się rekompensaty.",
  },
  {
    text: "Członkowie rzeczywiści Zielonogórskiego Klubu Fantastyki “Ad Astra” (organizator) nie mogą brać udziału w punktach programu, w czasie których uczestnicy mogą otrzymać od prowadzącego dany punkt walutę konwentową “Bachele”..",
  },
  {
    text: "Na terenie Bachanaliów zabrania się rozpowszechniania utworów chronionych prawami autorskimi, w sposób, który te prawa narusza.",
  },
  {
    text: "Organizator nie ponosi odpowiedzialności i nie utożsamia się z opiniami wygłaszanymi przez uczestników (w tym Prelegentów) podczas trwania konwentu.",
  },
  {
    text: "Na terenie Bachanaliów obowiązuje bezwzględny zakaz prowadzenia działalności politycznej, w szczególności kampanii wyborczych i agitacji politycznej. Osoby, które nie będą przestrzegać tego zakazu, mogą zostać usunięte z terenu konwentu.",
  },
  {
    text: "Każdy uczestnik zobowiązany jest do traktowania pozostałych uczestników z szacunkiem. Nękanie fizyczne lub słowne może skutkować usunięciem z konwentu i zgłoszeniem do odpowiednich służb.",
  },
  {
    text: "Zapisując się do udziału w konwencie uczestnik dobrowolnie wyraża zgodę na nieodpłatne wykorzystanie jego wizerunku utrwalonego w formie fotografii lub zapisu wideo oraz udziela organizatorowi konwentu nieodpłatnej licencji na wykorzystanie go na wszystkich polach eksploatacji, w tym: utrwalania i rozpowszechniania w dowolnej formie oraz wprowadzanie do pamięci komputera, wykorzystania do promocji i organizacji imprez organizowanych przez Zielonogórski Klub Fantastyki AD ASTRA, zamieszczania i publikowania na promocyjnych materiałach drukowanych organizatora, w prasie, na stronach internetowych oraz w przekazach telewizyjnych i radiowych.",
  },
  {
    text: "Uczestnikowi przysługuje prawo cofnięcia zgody opisanej w pkt. 36. Cofnięcie zgody odbywa się poprzez wysłanie do organizatora stosownej informacji na adres org@bachanalia.zgora.pl",
  },
  {
    text: "Wszelkie reklamacje można składać w formie pisemnej najpóźniej w terminie 14 dni od dnia zakończenia Bachanaliów na następujący adres korespondencyjny Organizatora: Zielonogórski Klub Fantastyki “Ad Astra”, ul. Fabryczna 13b, 65-410 Zielona Góra lub na adres mailowy zkf@adastra.zgora.pl, w obu wypadkach z dopiskiem Reklamacja – Bachanalia Fantastyczne.",
  },
  {
    text: "Organizator nie ponosi odpowiedzialności za skutki działania siły wyższej.",
  },
  {
    text: "W kwestiach nieuregulowanych powyższym regulaminem, zastosowanie mają odpowiednie przepisy Prawa Cywilnego, Karnego lub Karno-Skarbowego obowiązujące na terenie RP.",
  },
  {
    text: "Organizatorowi przysługuje prawo zmiany niniejszego Regulaminu, w szczególności z uwagi na potrzebę zapewnienia prawidłowego przebiegu Bachanaliów oraz bezpieczeństwa Uczestnikom.",
  },
];

export const regulationSections = [
  {
    id: "postanowienia-ogolne",
    title: "Postanowienia ogólne",
    start: 1,
    end: 10,
    rules: RULES.slice(0, 10),
  },
  {
    id: "udzial-i-akredytacja",
    title: "Udział i akredytacja",
    start: 11,
    end: 19,
    rules: RULES.slice(10, 19),
  },
  {
    id: "bezpieczenstwo-i-porzadek",
    title: "Bezpieczeństwo i porządek",
    start: 20,
    end: 33,
    rules: RULES.slice(19, 33),
  },
  {
    id: "program-i-odpowiedzialnosc",
    title: "Program i odpowiedzialność",
    start: 34,
    end: 43,
    rules: RULES.slice(33, 43),
  },
  {
    id: "reklamacje-i-zmiany",
    title: "Reklamacje i zmiany",
    start: 44,
    end: 47,
    rules: RULES.slice(43, 47),
  },
] as const satisfies readonly RegulationSection[];

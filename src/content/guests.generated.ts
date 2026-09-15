// Written by scripts/sync-guests.ts from the guests sheet; edit the sheet, not this file.
import type { Guest } from "./guests";

import agnieszka_fulinska from "./guests/agnieszka-fulinska.jpg";
import ola_radomska_budnik from "./guests/ola-radomska-budnik.jpg";
import andrzej_drzewinski from "./guests/andrzej-drzewinski.png";
import karolina_rozko from "./guests/karolina-rozko.jpg";
import maksymilian_a_brzezicki from "./guests/maksymilian-a-brzezicki.jpg";
import konrad_opalinski from "./guests/konrad-opalinski.jpg";
import artur_tojza from "./guests/artur-tojza.jpg";
import justyna_sygulska from "./guests/justyna-sygulska.jpg";
import blazej_kurowski from "./guests/blazej-kurowski.png";
import grzegorz_pawlak from "./guests/grzegorz-pawlak.jpg";
import tine_anthoni from "./guests/tine-anthoni.jpg";

export const guests: Guest[] = [
  { name: "Marta Kładź-Kocot", slug: "marta-kladz-kocot" },
  {
    name: "Agnieszka Fulińska",
    slug: "agnieszka-fulinska",
    photo: agnieszka_fulinska,
    bio: [
      "Co łączy XIX-wieczną Francję, Napoleona II, fantastykę, słowiańskie legendy i książki, które czytały całe pokolenia młodych czytelników? Agnieszka Fulińska.",
      "Historyczka, tłumaczka literacka i pisarka. Absolwentka filologii polskiej i archeologii klasycznej Uniwersytetu Jagiellońskiego, doktorka i badaczka. Naukowo zajmuje się przede wszystkim historią XIX wieku, ze szczególnym uwzględnieniem Francji i kulturowych wyobrażeń epoki. Kierowała m.in. finansowanym przez Narodowe Centrum Nauki projektem poświęconym legendzie „Orlątka” — Napoleona II — w kulturze XIX i XX wieku.",
      "Jako tłumaczka przełożyła dziesiątki książek z języka angielskiego, w tym powieści fantasy i literaturę młodzieżową. Jej przekłady obejmują m.in. książki Ricka Riordana, Trudi Canavan i Bekki Fitzpatrick. Sięga również po dziewiętnastowieczną poezję oraz teksty z języka francuskiego i nowogreckiego.",
      "Sama również tworzy fantastykę. Opublikowała już ponad 30 opowiadań! Wspólnie z Aleksandrą Klęczar napisała cykl „Dzieci Dwóch Światów”, którego pierwszy tom — „Mysia wieża” — zabiera czytelników nad Gopło, do świata, w którym słowiańskie legendy, archeologia, magia i współczesna przygoda splatają się w jedną historię. Kolejnym tomem są „Śpiący rycerze”.",
      'A jeżeli chcecie już teraz zajrzeć do tego, co siedzi w głowie Agnieszki, to zapraszamy na blog "Napoleon Inaczej"!',
      "https://www.facebook.com/share/1DDKFbPDve/ 🇫🇷 Spotkajcie Agnieszkę Fulińską podczas XL Bachanaliów Fantastycznych / Polconu 2026!",
    ],
  },
  {
    name: "Ola „Andzia” Radomska-Budnik",
    slug: "ola-radomska-budnik",
    photo: ola_radomska_budnik,
    bio: [
      "Ola „Andzia” Radomska-Budnik — geekowa psycholożka i psychoterapeutka, która wierzy, że życie może być fantastyczną przygodą. Pracuje terapeutycznie z nastolatkami i dorosłymi, wykorzystując m.in. Superhero Therapy, a od 4 lat prowadzi przestrzeń w sieci — Fantastyczną Kozetkę, gdzie łączy tematy psychologiczne z popkulturą. Prywatnie kocha czytać, pisać własne historie i grać w RPGi.",
    ],
  },
  { name: "Radosław Kot", slug: "radoslaw-kot" },
  {
    name: "Andrzej Drzewiński",
    slug: "andrzej-drzewinski",
    photo: andrzej_drzewinski,
    bio: [
      'Prof. dr hab. Andrzej Drzewiński – fizyk z Uniwersytetu Zielonogórskiego. Naukowo zaczynał od fizyki statystycznej i zjawisk krytycznych, obecnie z zespołem tworzy i bada magnetyczne metamateriały – sztuczne struktury o mikroskopijnej architekturze, powstające m.in. wtedy, gdy zawiesiny koloidalne wysychają w polu magnetycznym. Na uczelni, oprócz zajęć kursowych, prowadzi autorski kurs „Fantastyka naukowa dla fizyków" – bo naukę z fikcją lubi łączyć dosłownie.',
      'Jako pisarz debiutował w 1983 r. zbiorem „Zabawa w strzelanego", choć pierwsze opowiadania prezentował w Akademickim Radiu Politechniki Wrocławskiej już w 1978 r. Powieści i opowiadania pisał w duetach m.in. z Mirosławem Jabłońskim, Andrzejem Ziemiańskim i Jackiem Inglotem.',
      'Wraz z Adamem Cebulą, Eugeniuszem Dębskim i Piotrem Surmiakiem współtworzy grupę Kareta Wrocławski – jej opowiadanie „Pandemolium" otrzymało nominację do Nagrody im. Janusza A. Zajdla za rok 1998. Zbiór Karety „Upalna zima" (2012) to pięć historii osadzonych we wspólnym świecie fantasy, w których każda opowieść zahacza o konkretne zjawisko fizyczne – autorzy nazwali ten hybrydowy pomysł „science fantasy".',
      "Krytycy chwalili sam koncept; co do stylu humoru Karety i słabości jej bohaterów do mocniejszych trunków recenzenci – jak to bywa – mieli podzielone zdanie :).",
      'Popularyzuje naukę od lat 80. Wspólnie z Jackiem Wojtkiewiczem napisał „Opowieści z historii fizyki", uhonorowane Nagrodą Polskiego Towarzystwa Fizycznego im. Krzysztofa Ernsta; wcześniej otrzymał „Magnum Trophaeum" miesięcznika „Młody Technik". W ramach Dolnośląskiego Festiwalu Nauki poprowadził panel „DyLEMaty nauki przyszłości" z udziałem Stanisława Lema. Udzielił też Markowi Oramusowi obszernego wywiadu „Wielki plac budowy", opublikowanego w „Wiedzy i Życiu" (2014) i przedrukowanego w tomie „Na niebie i ziemi" (2018). Obecnie publikuje w „Uranii – Postępach Astronomii" wspólnie z Januszem Osarczukiem, a o nauce miał przyjemność rozmawiać z Arturem Belingiem na antenie Akademickiego Radia Index w cyklu audycji „To i owo naukowo".',
    ],
  },
  {
    name: "Karolina Rożko",
    slug: "karolina-rozko",
    photo: karolina_rozko,
    bio: [
      "Dr Karolina Rożko na co dzień zajmuje się astrofizyką pulsarów, ale posiada doktorat zarówno w dziedzinie astronomii, jak i filozofii. Pracuje w Instytucie Astronomii im. Prof. J. Gila na Uniwersytecie Zielonogórskim, zajmuje się również popularyzacją nauki jako Ambasadorka Edukacji Kosmicznej ESERO-Polska. Poza tym uwielbia grać w gry planszowe o kosmosie lub o kotach, a najlepiej o jednym i drugim.",
    ],
  },
  {
    name: "Maksymilian A. Brzezicki",
    slug: "maksymilian-a-brzezicki",
    photo: maksymilian_a_brzezicki,
    bio: [
      "Lekarz akademicki i inżynier, pełni rolę kierownika Zakładu Neuroinżynierii i Medycyny Kosmicznej Uniwersytetu Zielonogórskiego, wykładowcy medycyny na Uniwersytecie Oxfordzkim oraz współpracownika naukowego Centrum Badań Kosmicznych PAN. Na co dzień pracuje w Klinicznym Oddziale Neurologii Szpitala Uniwersyteckiego w Zielonej Górze. Jego zainteresowania naukowe obejmują neuroinżynierię, medycynę kosmiczną i choroby rzadkie.",
      "Ukończył studia medyczne na Uniwersytecie Oxfordzkim (medycyna akademicka i inżynierska, doktorat DPhil) oraz w Bristolu (szkoła kliniczna). Odbywał staże specjalistyczne w Szpitalu Uniwersyteckim im. Johna Radcliffa w Oxfordzie, Królewskim Instytucie Chorób Dzieci w Bristolu oraz w Uniwersyteckim Centrum Urazowym w Southmead. W badaniach łączy czujniki ubieralne, analizę kinematyczną, computer vision i uczenie maszynowe do obiektywnej oceny zaburzeń neurologicznych: progresji choroby, odpowiedzi na leczenie, predykcji upadków oraz zmian motorycznych u pacjentów po głębokiej stymulacji mózgu (DBS). W ramach współpracy interdyscyplinarnej rozwija również obiektywne testy psychozy oparte na biomarkerach i analizie obliczeniowej. W obszarze medycyny kosmicznej opracowuje rozwiązania neuroinżynierskie do obiektywnego pomiaru uszkodzeń ośrodkowego układu nerwowego w warunkach lotu kosmicznego.",
    ],
  },
  {
    name: "Konrad Opaliński",
    slug: "konrad-opalinski",
    photo: konrad_opalinski,
    bio: [
      'Konrad Opaliński - psycholog, wykładowca w Instytucie Psychologii Uniwersytetu Zielonogórskiego. Specjalizuje się w badaniach dotyczących funkcjonowania w środowiskach ekstremalnych. Realizował badania w Polskiej Stacji Polarnej Hornsund na Spitsbergenie oraz analogowym habitacie kosmicznym LunAres. Współtworzył projekt AstroMentalHealth – pierwszy polski eksperyment psychologiczny realizowany na ISS w ramach misji IGNIS. Laureat ogólnopolskiego konkursu „MISJA POLARNA" na najlepszy interdyscyplinarny projekt badawczy organizowany przez Instytutu Geofizyki PAN oraz Edu Arctic. Kończy doktorat poświęcony doświadczeniom podobnym do psychotycznych. Członek Polskiego Towarzystwa Psychiatrycznego, Polskiego Towarzystwa Astromedycznego oraz Polskiego Klubu Polarnego.',
    ],
  },
  { name: "Marek Marcinkowski", slug: "marek-marcinkowski" },
  { name: "Istvan Vizvary", slug: "istvan-vizvary" },
  { name: "Marek Baraniecki", slug: "marek-baraniecki" },
  { name: "Artur Olchowy", slug: "artur-olchowy" },
  { name: "Łukasz Kucharczyk", slug: "lukasz-kucharczyk" },
  { name: "Justyna Hankus", slug: "justyna-hankus" },
  { name: "Rafał Kosik", slug: "rafal-kosik" },
  { name: "Michał Organiściak", slug: "michal-organisciak" },
  { name: "M.P. Hardy", slug: "m-p-hardy" },
  { name: "Agnieszka „Angaya” Przychodniak", slug: "agnieszka-przychodniak" },
  { name: "Paweł Adwejuk", slug: "pawel-adwejuk" },
  { name: "Stanisław Mąderek", slug: "stanislaw-maderek" },
  { name: "Dominika Błaszczyk", slug: "dominika-blaszczyk" },
  { name: "Przemysław Rudź", slug: "przemyslaw-rudz" },
  { name: "Tomasz Kołodziejczak", slug: "tomasz-kolodziejczak" },
  { name: "Marta Duda-Gryc", slug: "marta-duda-gryc" },
  { name: "Xavier Dollo", slug: "xavier-dollo" },
  { name: "Bartek Biedrzycki", slug: "bartek-biedrzycki" },
  {
    name: "Artur Tojza",
    slug: "artur-tojza",
    photo: artur_tojza,
    bio: [
      "Pisarz amator, który dzięki żonie-redaktorce (W sieci słów) zaczął wydawać książki, które pisał przez 20 lat do szuflady budując Multiwersum Snów, gdzie magia zderza się ze space operą. Twórca bloga opiniotwórczego W pajęczej sieci powstałego w 2013 roku, który od 2022 roku został przeniesiony na kanał YT o tej samej nazwie. Omawia na nim komiksy, książki, gry i filmy, czyli wszystko to, co służy mu za inspirację do pisania kolejnych książek rozrywkowych.",
      "Jak sam podkreśla: Wszystkie moje książki budują Multiwersum Snów, ale tylko część z nich uczestniczy w Wojnie Snów.",
      'Wydaje swoje książki w formie cyfrowej jako e-booki. Od 2025 roku za sprawą wydawnictwa KMH Media pojawiają się również w formie audiobooków, a w 2026 pierwsza z nich, "Piekło kosmosu", doczekała się wydania w formie audioserialu na platformie Audioteka.',
    ],
  },
  {
    name: "Justyna „Kiki” Sygulska",
    slug: "justyna-sygulska",
    photo: justyna_sygulska,
    bio: [
      "Komiksowa scenarzystka i certyfikowana nauczycielka jogi (RYT200) oraz jogi nidry (YACEP)!",
      "Warsztat jogowy wspierający osoby pracujące przy biurku i spędzające długie godziny na rysowaniu i pracy nad planszami komiksowymi, skupiony na prostych ćwiczeniach wykonywanych na siedząco i stojąco.",
      "W planie m.in. rozluźnianie karku, barków i pleców oraz mobilizacja nadgarstków, czyli ratunek po wielu godzinach przy biurku. Pojawią się też krótkie sekwencje ruchowe idealne między kolejnymi kadrami. Trochę rozciągania, trochę wzmacniania, żeby ciało nie było bardziej połamane niż superbohater po walce z bossem. Zajęcia bez spiny, bez doświadczenia i bez specjalnego sprzętu.",
    ],
  },
  {
    name: "Błażej „Qrjusz” Kurowski",
    slug: "blazej-kurowski",
    photo: blazej_kurowski,
    bio: [
      'Twórca komiksów z Łodzi. Autor lubianej serii Stachanowiec in Space, zina VLEPKAZIN, rysownik komiksów "Kiki w krainie Yokai" i "Crisis City" oraz licznych krótkich form komiksowych. Laureat nagrody miesięcznika Nowa Fantastyka (Polski Komiks Roku 2026), nagrody Orient Men Polskiego Stowarzyszenia Komiksowego (Najlepsze rysunki 2026) i nagrody specjalnej festiwalu Pyrkon: Fantastycznie Utalentowani (za Fantastyczny komiks 2026). Miłośnik karcianek, planszówek, jRPG i bitewniaków. Fan baseballu (zarówno japońskiej i amerykańskiej ligi) i zielonej herbaty. Jego ulubiony Pokemon to Darumaka.',
    ],
  },
  { name: "Grażyna „Graza” Kasprzak", slug: "grazyna-kasprzak" },
  { name: "Zbigniew „Kas” Kasprzak", slug: "zbigniew-kasprzak" },
  { name: "Robert Adler", slug: "robert-adler" },
  { name: "Tomasz Niewiadomski", slug: "tomasz-niewiadomski" },
  { name: "Tomasz Minkiewicz", slug: "tomasz-minkiewicz" },
  {
    name: "Grzegorz Pawlak",
    slug: "grzegorz-pawlak",
    photo: grzegorz_pawlak,
    bio: [
      "Twórca ilustracji do książek i magazynów oraz projektant grafiki użytkowej z wykształceniem architektonicznym. Sam jednak najchętniej określa się mianem rysownika komiksów.",
      "Debiutował na łamach magazynu komiksowego B5 #3, a następnie publikował w licznych zinach, antologiach i magazynach, m.in. „Ziniol”, „FEST” oraz „Niczego sobie. Komiksy o mieście Gliwice”.",
      "Jego pierwszym albumem komiksowym był „Benedykt Dampc i skarb piratów”, narysowany do scenariusza Jerzego Szyłaka. Wśród kolejnych publikacji znajdują się m.in. „Profesor Andrews” (scenariusz: Dominik Szcześniak, na podstawie opowiadania Olgi Tokarczuk), „Centrum wszechświata”, zrealizowane wspólnie z Danielem Gizickim, a także komiksy związane z serią „Wydział 7”, do której przygotował dotychczas trzy zeszyty.",
      "Od kilku lat współpracuje z magazynem „Nowa Fantastyka”, przygotowując ilustracje do publikowanych opowiadań. Jest również autorem okładki i ilustracji do książki „Duch Świąt” Anny Kańtoch. Przygotował storyboard do animacji wykorzystanej w serialu dokumentalnym Polsatu „Powstanie warszawskie”, a także materiał komiksowy do publikacji „Zdobyć PAST-ę” Marka Millera.",
      "Pracuje nad serią „Pętla” do scenariusza Dominika Szcześniaka, projektem „Low Story”, tworzonym wraz z Danielem Gizickim, oraz albumem „Hope”, napisanym przez Marcina Bałczewskiego.",
      "Od ponad dziesięciu lat rozwija również swój autorski projekt NOIRtober, cykl artzinów powstających w ramach corocznego wyzwania #Inktober, w którym eksploruje estetykę noir i narrację obrazową.",
      "Na co dzień pozostaje miłośnikiem szeroko pojętej (pop)kultury, od filmu, literatury i komiksu, przez seriale, po gry komputerowe.",
    ],
  },
  { name: "Małgorzata Kisiel-Dorohnicka", slug: "malgorzata-kisiel-dorohnicka" },
  { name: "Wacław Kisiel-Dorohnicki", slug: "waclaw-kisiel-dorohnicki" },
  { name: "Jakub Łagoda", slug: "jakub-lagoda" },
  { name: "Roberto Recchioni", slug: "roberto-recchioni" },
  { name: "Emiliano Tanzillo", slug: "emiliano-tanzillo" },
  { name: "Antonio Marinetti", slug: "antonio-marinetti" },
  {
    name: "Tine Anthoni",
    slug: "tine-anthoni",
    photo: tine_anthoni,
    bio: [
      "Tine Anthoni (1982) posiada tytuł magistra języków i literatury germańskiej (KULeuven) oraz zarządzania kulturą i edukacji (VUBrussel). Pracuje w Belgijskim Centrum Komiksu od 2006 roku, a od 2020 roku jest zastępcą dyrektora i kierownikiem ds. komunikacji i edukacji. Jako specjalistka ds. edukacji nadzoruje opracowywanie programów edukacyjnych, materiałów i działań dla różnych grup odbiorców muzeum.",
    ],
  },
  { name: "Alessandro Ceccarelli", slug: "alessandro-ceccarelli" },
  { name: "KP Zakrzewicz", slug: "kp-zakrzewicz" },
  { name: "Krzysztof Pielaszek", slug: "krzysztof-pielaszek" },
  { name: "Jacek Drewnowski", slug: "jacek-drewnowski" },
  { name: "Wojciech Jędrak", slug: "wojciech-jedrak" },
  { name: "Max Suski", slug: "max-suski" },
  { name: "Józef Śliwiński", slug: "jozef-sliwinski" },
  { name: "Łukasz Nowak", slug: "lukasz-nowak" },
  { name: "Michał Fret", slug: "michal-fret" },
  { name: "Krzysztof Skrzypski", slug: "krzysztof-skrzypski" },
  { name: "Daniel Taberski", slug: "daniel-taberski" },
];

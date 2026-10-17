# Savings Calculator – retningslinjer for Claude

## Om projektet
En opsparingsberegner (dansk brugerflade), der viser opsparingens vækst ud fra startbeløb,
indbetalinger og antal år, og sammenligner to scenarier, fx forskellige pensionsselskaber
eller en bankpension med ETF'er. Siden ligger på GitHub Pages:
https://bhojland-dev.github.io/savings-calculator/

Planlagt: en iOS-app i SwiftUI, der bruger samme beregning og data.

## Om brugeren
Brugeren er ikke udvikler. Forklar valg og konsekvenser i almindeligt dansk uden fagjargon,
og giv en anbefaling frem for en lang liste af muligheder.

## Arbejdsgang
1. **Afklar før du koder.** Ved nye funktioner og større ændringer: præsentér de konkrete valg
   (data, design, hvad der udelades) som korte spørgsmål eller et forslag, og vent på svar.
   Små, tydelige rettelser, som brugeren peger på, må laves direkte.
2. **Én ting ad gangen.** Hold hver ændring lille og afgrænset. Bland ikke oprydning ind i en ny funktion.
3. **Byg ikke om uden lov.** Hvis brugeren kritiserer noget, så spørg, hvad der skal ændres, før du bygger om.
4. **Vis ændringen** (diff og evt. skærmbillede) og spørg, før du committer og pusher.
5. **Tjek i browseren** i både lyst og mørkt tema og i mobil- og desktopbredde, før du siger, at noget er færdigt.

## Arkitektur
Koden deles i tre lag, der ikke blander sig i hinanden:

| Lag | Ansvar | Må ikke |
|---|---|---|
| **Data** | Selskaber, produkter, ÅOP, kilder og datoer. Udstilles via et lille modul (en "dataservice") med funktioner som `getProviders()` og `getProduct(id)`. | Kende til beregning eller HTML. |
| **Beregning** | Rene funktioner: input ind, tal ud (fx `simulateSavings()`). | Læse fra eller skrive til siden (DOM). |
| **Visning** | Læser felterne, kalder beregningen, viser resultater og graf. | Indeholde forretningslogik, tal eller tabeller med data. |

- Frontenden henter altid data gennem dataservicen og aldrig direkte fra en tabel.
  Så kan kilden senere skiftes (fx til et API eller et opdateringsscript) uden at resten ændres.
- Hver datapost har en kilde (URL), en dato og en beskrivelse af, hvad tallet dækker
  (fx "samlet ÅOP for standardkunde" eller "kun fondens omkostninger").
- Beregningslaget skal kunne genbruges som facit, når iOS-appen bygges.

## Kodestil
- **Små funktioner med ét ansvar.** Hvis en funktion både regner og opdaterer siden, så del den.
- **Beskrivende navne** på engelsk i koden (`netReturnA`, ikke `nA`). Brugerfladen er på dansk.
- **Ingen magiske tal** midt i koden. Konstanter navngives og samles øverst eller i datalaget.
- **Ingen hurtige hacks**: ret filer med almindelige redigeringer, ikke find-og-erstat-scripts.
- **Kommentarer forklarer hvorfor**, ikke hvad koden gør.
- **Farver og mål** defineres som CSS-variabler i `:root` med varianter til lyst og mørkt tema.
- Ingen nye afhængigheder (biblioteker, værktøjer) uden aftale med brugeren.

## Test
- Beregningen skal have tests med kendte resultater. Facit med standardværdierne
  (100.000 kr. start, 3.000 kr./md., 20 år, 7 % afkast): 0,4 % ÅOP giver 1.814.241 kr.,
  1,3 % ÅOP giver 1.618.563 kr.
- Kør testene før commit.

## Data og ansvar
- Brug officielle kilder, hvor det er muligt (selskabets faktaark, Forsikring & Pension).
  Står der en mellemkilde, skal det fremgå.
- Gør det tydeligt på siden, at tallene er generelle og ikke personlig rådgivning.

## Git
- Commit-beskeder på engelsk: kort titel og en linje om hvorfor.
- Commit og push kun, når brugeren har sagt ja.

## Eksterne tjenester
- Figma: brugeren har få kald om måneden på den gratis plan. Spørg før du bruger dem,
  og brug så få som muligt.

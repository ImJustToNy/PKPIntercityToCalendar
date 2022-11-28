document.querySelectorAll('#print_area > div.content > div > div > form > div.lista_biletow_wrapper > div > div.orange').forEach(ticket => {
    const buttonsCell = ticket.querySelector('div.table_div_cell:nth-child(7)');

    const addToCalendarButton = document.createElement('input');

    addToCalendarButton.classList.add('orangebutton');
    addToCalendarButton.type = 'button';
    addToCalendarButton.value = 'Do kalendarza';

    buttonsCell.append(addToCalendarButton);

    addToCalendarButton.addEventListener('click', async () => {
        const ticketCell = ticket.querySelector('div.first');
        const directionsCell = ticket.querySelector('div.table_div_cell_relacja');
        const timeAndDateCell = ticket.querySelector('div.table_div_cell_wyjazd_od_do');

        const ticketNumber = ticketCell.querySelector('a').innerText.replace(/\D/g, '');

        const [departureStation, arrivalStation, connectionId] = directionsCell.innerText.split('\n');

        const departureDate = timeAndDateCell.querySelector('div.display-inline:nth-child(2)').innerHTML.trim();
        const departureTime = timeAndDateCell.querySelector('div.display-inline:nth-child(5)').innerHTML.trim();

        const arrivalDate = timeAndDateCell.querySelector('div.display-inline:nth-child(9)').innerHTML.trim();
        const arrivalTime = timeAndDateCell.querySelector('div.display-inline:nth-child(12)').innerHTML.trim();

        const ticketUrl = `https://bilet.intercity.pl/BiletPDF?bilet=${ticketNumber}`;

        let seats = '', wagon, legend;

        await pdfjsLib.getDocument(ticketUrl).promise.then(async function (pdf) {
            await pdf.getPage(1).then(async function (page) {
                await page.getTextContent().then(function (textContent) {
                    wagon = textContent.items[49].str + textContent.items[51].str;

                    let lookingForSeats = true;

                    for (let i = 53; lookingForSeats; i += 4) {
                        seats += textContent.items[i].str + textContent.items[i + 2].str + ' ';

                        lookingForSeats = seats.endsWith(', ');
                    }

                    for (let i in textContent.items) {
                        if (textContent.items[i].str.startsWith('LEGENDA:')) {
                            legend = textContent.items[i].str.replace('LEGENDA:', 'Legenda:');
                            break;
                        }
                    }
                });
            });
        }, function (reason) {
            console.error(reason);
        });

        atcb_action({
            'name': `Podróż ${departureStation} - ${arrivalStation}`,
            'description': `Numery miejsc: ${seats}<br>Numer wagonu: ${wagon}<br>Numer pociągu: ${connectionId}<br>Link do biletu: [url]${ticketUrl}[/url]<br>${legend}`,
            'startDate': departureDate,
            'endDate': arrivalDate,
            'startTime': departureTime,
            'endTime': arrivalTime,
            'iCalFileName': `Podroz-${ticketNumber}`,
            'language': 'pl',
            'timeZone': 'Europe/Warsaw',
            'options': [
                'Apple',
                'Google',
                'iCal',
                'Microsoft365',
                'MicrosoftTeams',
                'Outlook.com',
                'Yahoo'
            ],
        }, addToCalendarButton);
    });
});
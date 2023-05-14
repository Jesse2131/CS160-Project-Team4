# CS 160 - Team 04

## FOR THE GRADER 
When showing the TA our code during the presentation day we ran into some network issues/small code issues that 
affected our program. In the final submission of our project the issue has been fixed. If you could check back on any
of the notes the TA made and see differences that would be greatly appreciated.
## **To run a local instance from github**
1. git clone https://github.com/Jesse2131/CS160-Project-Team4.git
2. npm install
3. Make sure host is set to localhost in the server.js file
4. node server.js 

## **Run Docker Image Instructions**
1. docker pull jesse24/odfds_team4 
2. docker run -d -p port:13000 jesse24/odfds_team4 

NOTE: The port number can be anything, perferrably > 10,000. If running into issues try a diff port number
example run: docker run -d -p 13001:13000 jesse24/odfds_team4 

3.  go to: localhost:port 

    Example: localhost:13001

## Important Notes for Usage
User should NOT be able to be logged in to multiple users in different tabs of the same browser -> They must logout of one then log into the next.
*Real-world applications reflect this same structure.*
For testing, you can log in from different browsers at the same time or use incognito browsers. 

1. Customer/Driver accounts don't exist yet, should create them
2. We have a default restaurant account with email rest@gmail.com and password 123456. Feel free to create more restaurants as well. 
3. When a restaurant confirms an order, the driver is selected based on cheapest delivery fee. The driver must also be ONLINE (by logging into a driver account and going online). If there are no drivers online, a restaurant cannot pay for an order to be delivered. 
4. Project flow is as follows: Customer orders from a restaurant menu -> Restaurant account receives this order and pays for the delivery fee and assigns the order to the driver -> Driver will then receive this order and will click through where they are in the order. 

## The Team
1. Bryan Christiano
2. Jesse Dong
3. Kelvin Enrique Lopez
4. Kevin Ly
5. Huy Gia Ong
6. Gargi Sunil Tawde
## **ODFDS**: **An On-Demand Food Delivery Service**
### Problem Statement (as provided by our professor)
A new bay area food delivery service, ODFDS, has begun to serve Santa Clara County. The business will allow restaurants to request delivery of their take-out orders. ODFDS will match the nearest available driver to the restaurant and dispatch him/her for pickup and delivery. ODFDS needs a system for sub-contracted drivers to locate their next request for the food delivery. Require mapping, time-based traffic events, and location based searches to guarantee the wait time to < 40 minutes from the time of request.

You are responsible to develop the IT infrastructure and website for both the restaurants and drivers. Restaurants can go onto this website and request a delivery. The cost is based on distance and time (like how a taxi works) with a minimum cost of $5 (first mile is free) with subsequent mile is $2/mile. The website will include logic to find the next closest available driver based on real-time driving time to each restaurant request. Once it does, it will dispatch the drivers to the restaurant location. Need to be able to track the driver and new customer request via Google map (or other mapping services like MapBox). Should use map services to calculate driving distances with traffic and other information included.

Special note: We use Google Map (or other mapping services like MapBox) for routing. Each driver can pick up 1-2 different orders from the same restaurant but not from different restaurants. If 2 orders are being dispatch from the same restaurant to 2 different locations, the delivery cost of the 2nd order cannot be more than the cost of the original distance from the restaurant to the customer address.
## Implementation
### Tech Stack
Software:
- **HTML, CSS** *frontend and general website layout*
- **JavaScript** *general website functionality and integration with other software/tools*
- **FireBase** *user authentication*
- **Docker** *Docker image*
- **Google Maps API** *map functionality*
- **Stripe** *payment functionality*
- **NodeJS and Express** *Live server*

Soft-Skill Tools:
- **Zoom** *team meetings*
- **Notion** *meeting notes, README write-up*
- **Jira** *Agile Workflow, Backlog*
- **JetBrains (IntelliJ and WebStorm)** *development environment*
- **VS Code** *development environment*
- **Adobe XD** *wireframing/design*
- **Adobe Photoshop** *logo design*
- **[Coolors.co](http://coolors.co)** *color palette development*

### Design Inspiration
<img width="1508" alt="image" src="https://user-images.githubusercontent.com/40704006/235800427-092e250c-0133-4f82-83ec-8edf891ce893.png">
*Initial design concept made by: Gargi Tawde*

### Users
1. **Restaurant** *can accept orders, edit their available menu, and pay for deliveries*
2. **Customer** *places an order and can see its progress once it is accepted and restaurant/driver start to fulfill it*
3. **Driver** *goes online, then is assigned orders to fulfill*



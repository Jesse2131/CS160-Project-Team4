# CS 160 - Team 04

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
*Initial design concept made by: Gargi Tawde


# CS160-Team 4

## **Team Members**

1. Christiano,Bryan	
2. Dong,Jesse	
3. Lopez,Kelvin Enrique	
4. Ly,Kevin	
5. Ong,Huy Gia	
6. Tawde,Gargi Sunil

## **ODFS**
To run the docker image 
1. docker pull jesse24/odfds_team4 
2. docker run -d -p port:13000 jesse24/odfds_team4 

NOTE: The port number can be anything, perferrably > 10,000. If running into issues try a diff port number
example run: docker run -d -p 13001:13000 jesse24/odfds_team4 

3. go to: localhost:port 

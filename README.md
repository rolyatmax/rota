Rota
====

Another reinforcement learning adventure! I wrote this on the heels of my [Maze project](https://tbaldw.in/maze) upon realizing that a similar method could be used to route packets in a network. In a maze, there is one start, one end, and usually just one path. In Rota, there are as many starts and ends as there are nodes in the network and an infinite number of paths.

I figured that one of the interesting properties of the Maze project was that the knowledge and the learning was distributed among the "forks" in the maze. This seemed like an advantage when applied to network routing where a decentralized routing system could hold up in the face of network partitions without losing significant routing knowledge or functionality.

In Rota, the grid represents a network of nodes and their connections. When you drop packets into the network, they are randomly assigned an address (or destination node) and a node to start from. As a packet is sent from node to node (at first by randomly selecting a neighboring node), the nodes learn which neighbor offers the best probability for getting the packet to its destination in the least amount of time. (Packets turn red as the time they've been in the network increases.)

Interestingly, the routing knowledge (and the learning itself) is distributed among all the nodes in the system. This means that none of the nodes has a knowledge of the network topology or _even if any of their neighbors is the addressee_. Indeed, the addresses themselves could be obscurred with a hashing function without affecting the routing functionality.

You can click on the connections between the nodes to add/remove them. The lighter the line, the larger the latency - darker lines are faster connections - and the routing algorithm will optimize for fastest delivery, not necessarily the fewest number of steps. You can click around on the connections, changing the topology of the network, and then watch the nodes adapt to the new network as more and more packets are added.

Reinforcement learning is essentially based on a trial-and-error methodology, so the more packets a topology has routed, the better it will be at routing future packets. In some topologies, certain nodes will be difficult to reach. By dropping in packets addressed to a specific node, the nodes in the network will become better and better and routing packets to that node.

There are a number of improvements I hope to make which haven't made their way into this version of rota. I'd like to make available better metrics, heatmaps for each address, TTLs for packets, and have each connection's traffic affect its latency. This last change would allow the algorithm to be tested for its ability to evenly distribute traffic in the network.

------------------------

# Requirements

To run this project yourself, just clone the repo and run from the root:

```bash
npm install
node_modules/.bin/watchify js/main.js -o js/build.js -v
open index.html
```

------------------------

You can see this project live at [tbaldw.in/rota](https://tbaldw.in/rota) or check out the code at [github.com/rolyatmax/rota](https://github.com/rolyatmax/rota).

export function printBoth(ns, str) {
	ns.print(str);
	ns.tprint(str);
}

export function routeFinder(ns, server) {
	let route = [];
	let found = recursiveRouteFinder(ns, '', ns.getHostname(), server, route);
	if (found) return route;
	else return null;
}

export function recursiveRouteFinder(ns, parent, host, server, route) {
	const children = ns.scan(host);
	for (let child of children) {
		if (parent === child) {
			continue;
		}
		if (child === server) {
			route.unshift(child);
			route.unshift(host);
			return true;
		}
		if (recursiveRouteFinder(ns, host, child, server, route)) {
			route.unshift(host);
			return true;
		}
	}
	return false;
}

export function getServers(ns) {
	let servers = new Set(['home']);
	recursiveScan('home', servers, ns);
	return [...servers];
}

export function recursiveScan(host, servers, ns) {
	let hosts = ns.scan(host);
	for (let h of hosts) {
		if (!servers.has(h)) {
			servers.add(h);
			recursiveScan(h, servers, ns);
		}
	}
}

export function hackServer(ns, server) {
	if (ns.hasRootAccess(server)) return true;

	let portOpened = 0;
	if (ns.fileExists('BruteSSH.exe')) {
		ns.brutessh(server);
		portOpened++;
	}
	if (ns.fileExists('FTPCrack.exe')) {
		ns.ftpcrack(server);
		portOpened++;
	}
	if (ns.fileExists('HTTPWorm.exe')) {
		ns.httpworm(server);
		portOpened++;
	}
	if (ns.fileExists('relaySMTP.exe')) {
		ns.relaysmtp(server);
		portOpened++;
	}
	if (ns.fileExists('SQLInject.exe')) {
		ns.sqlinject(server);
		portOpened++;
	}

	if (ns.getServerNumPortsRequired(server) <= portOpened
		&& ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
		ns.nuke(server);
		return true;
	}

	return false;
}

export function getAccessibleServers(ns) {
	return getServers(ns).filter(server => hackServer(ns, server));
}

export async function backdoor(ns, server) {
	let route = routeFinder(ns, server);
	if (route && hackServer(ns, server)) {
		for (let serv of route) {
			ns.connect(serv);
		}
		ns.tprint(`Installing backdoor on ${server}.`);
		await ns.installBackdoor();
		ns.tprint(`Backdoor successfully installed.`);
		for (let serv of route.reverse()) {
			ns.connect(serv);
		}
	}
}
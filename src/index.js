import fs from 'fs';
import AWS from 'aws-sdk';

const Bucket = 'compression-space-transport';
const StatusPrefix = 'status-files';

const autoUploadTargets = [
	{ localPath: '/var/lib/dhcpd/dhcpd.leases', key: `${StatusPrefix}/dhcpd.leases` },
	{ localPath: '/var/log/system-data.json', key: `${StatusPrefix}/system-data.json` },
	{ localPath: '/var/log/iptstate.txt', key: `${StatusPrefix}/iptstate.txt` },

	{ localPath: '/var/log/nmap.json', key: `${StatusPrefix}/nmap.json` },

	{ localPath: '/lib/systemd/system/config-copy.service', key: `${StatusPrefix}/config-copy.service` },
	{ localPath: '/lib/systemd/system/tail2s3.service', key: `${StatusPrefix}/tail2s3.service` },
	{ localPath: '/lib/systemd/system/stats-generator.service', key: `${StatusPrefix}/stats-generator.service` },
];

const scheduledUploadTargets = [
	{ localPath: '/var/log/messages', key: `${StatusPrefix}/messages`, waitMs: 15000 },
];

const s3 = new AWS.S3();

function upload({ localPath, key }) {
	const body = fs.readFileSync(localPath);
	const params = {
		Bucket,
		Key: key,
		Body: body,
	};
	return new Promise((resolve, reject) =>
		s3.putObject(params, (err, data) => 
			(err) ? reject(err): resolve(data)));
}

function autoUpload({ localPath, key }) {
	fs.watchFile(localPath, () => {
		console.log('Updating file', localPath);
		upload({ localPath, key });
	});	
}

function scheduledUpload({ localPath, key, waitMs }) {
	setInterval(() => {
		console.log('Updating file', localPath);
		upload({ localPath, key });
	}, waitMs);
}

function main() {
	autoUploadTargets.forEach(autoUpload);
	scheduledUploadTargets.forEach(scheduledUpload);
}
main();

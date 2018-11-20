import fs from 'fs';
import AWS from 'aws-sdk';

const Bucket = 'compression-space-transport';
const StatusPrefix = 'status-files';

const targets = [
	{ localPath: '/var/lib/dhcpd/dhcpd.leases', key: `${StatusPrefix}/dhcpd.leases` },
	{ localPath: '/var/log/system-data.json', key: `${StatusPrefix}/system-data.json` },
	{ localPath: '/var/log/iptstate.txt', key: `${StatusPrefix}/iptstate.txt` },

	{ localPath: '/lib/systemd/system/config-copy.service', key: `${StatusPrefix}/config-copy.service` },
	{ localPath: '/lib/systemd/system/tail2s3.service', key: `${StatusPrefix}/tail2s3.service` },
	{ localPath: '/lib/systemd/system/stats-generator.service', key: `${StatusPrefix}/stats-generator.service` },
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

function main() {
	targets.forEach(autoUpload);
}
main();

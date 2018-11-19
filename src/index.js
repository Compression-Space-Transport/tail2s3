import fs from 'fs';
import AWS from 'aws-sdk';

const Bucket = 'compression-space-transport';
const StatusPrefix = 'status-files';

const targets = [
	{ localPath: '/var/lib/dhcpd/dhcpd.leases', key: `${StatusPrefix}/dhcpd.leases` },
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

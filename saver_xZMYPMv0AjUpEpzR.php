<?php

header('Content-Type: application/json');

define('CONFIG_FILE', './config/kockaleny.json');

$output['success'] = false;

if ('' == $_POST['json']) {
	$output['error']['id'] = 100;
	$output['error']['msg'] = 'json mezőt ki kell tölteni!';
	die(json_encode($output));
}

$check = json_decode($_POST['json']);
if (0 < json_last_error()) {
	$output['error']['id'] = json_last_error();
	$output['error']['msg'] = json_last_error_msg();
	die(json_encode($output));
}

$json_data = json_encode($check, JSON_PRETTY_PRINT);
file_put_contents(CONFIG_FILE, $json_data);

$output['success'] = true;

echo json_encode($output);

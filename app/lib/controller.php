<?php

require('class/BCGFontFile.php');
require('class/BCGColor.php');
require('class/BCGDrawing.php');
require('class/BCGcode39.barcode.php');
 
//include the Fellowship One class
require($_SERVER['DOCUMENT_ROOT'] . '/coreLib/fellowshipOne/FellowshipOne.php');

//include the Fellowship One class
require($_SERVER['DOCUMENT_ROOT'] . '/coreLib/fellowshipOne/FellowshipOne-People.php');

/* F1 API setttings*/
$f1Settings = array(
'key'=>'XXX',
'secret'=>'XXXXXX',
'username'=>'XXXX',
'password'=>'XXXX',
'baseUrl'=>'XXXX',
'debug'=>false,
); 

if (!isset($_SESSION['f1Obj'])) {
	//if the F1Obj isn't created, create it	
	$_SESSION['f1Obj'] = new FellowshipOne($f1Settings);
	//create the sub-objects you're going to use (and pass it the core object)
	$_SESSION['f1PeopleObj'] = new FellowshipOnePeople($_SESSION['f1Obj']);
	
	if(($r = $_SESSION['f1Obj']->login()) === false){
		//send back error in JSON string
		$loginerror=json_encode(array('action'=>'f1Error'));
		echo $loginerror;
		exit;
		//die('Error logging in. Please try again later');		
	} 
}


switch ($_POST['method']) {

	case 'findBarCode':
		$results = findBarCode();
		echo json_encode($results);
		break;
	default:
		findBarCode();
		break;
}

function findBarCode() {

	//build the search params (you cannot search by DOB and something else, so search for just name for now)
	$params = array('searchFor'=>stripslashes($_POST['fname']) . ' ' . stripslashes($_POST['lname']));

	$userdob = $_POST['dob'];

	//send call to F1
	$results = $_SESSION['f1PeopleObj']->searchPeople($params);

	//create array for DOB filter
	$filteredResults = array();
	
	if ($results['results']['@count'] > 0) {
		
		//do DOB comparison to send to the recordList page
		foreach($results['results']['person'] as $person) {
			//get the DOB that comes out of Fellowship One
			
			if ($person['dateOfBirth'] != '') {

				$f1DOBarr = explode('/', date('m/d/Y',strtotime($person['dateOfBirth'])));
				$userDOBarr = explode('/',date('m/d/Y',strtotime($userdob)));
				
				//compare the month, day and year of each one separately.  Every piece must match for you to have a match
				if ($f1DOBarr[0] == $userDOBarr[0] && $f1DOBarr[1] == $userDOBarr[1] && $f1DOBarr[2] == $userDOBarr[2]) {
					//we have a match! add to the array	
					array_push($filteredResults,$person);
				}
			}						
 		}

	}
		
	if (count($filteredResults) == 1) {

		$personObj = $filteredResults[0];

		if ($personObj['barCode'] == '') {
			//if the person doesn't have a barcode, update their barcode before sending back
			//(you just need to send the person obj to this function and it updates their barcode to their person ID)
			$updatePersonArr = $_SESSION['f1PeopleObj']->getPersonById($personObj['@id']);
			$updatePersonArr['person']['barCode'] = $updatePersonArr['person']['@id'];
			
			$updatedPerson = $_SESSION['f1PeopleObj']->updatePerson($updatePersonArr);
			//set the person obj to the updated one that comes back
			$personObj = $updatedPerson['person'];
		}
		
		//draw the barcode image on the server
		$colorFront = new BCGColor(0, 0, 0);
		$colorBack = new BCGColor(255, 255, 255);
		$font = new BCGFontFile('./class/font/Arial.ttf', 18);
		$code = new BCGcode39(); // Or another class name from the manual
		$code->setScale(1); // Resolution		
		$code->setForegroundColor($colorFront); // Color of bars
		$code->setBackgroundColor($colorBack); // Color of spaces
		$code->setFont($font); // Font (or 0)
		$code->parse($personObj['barCode']); // Text
		
		$filename = $personObj['barCode'] . '.png';

		$drawing = new BCGDrawing($filename, $colorBack);
		$drawing->setBarcode($code);
		$drawing->draw();
		$drawing->finish(BCGDrawing::IMG_FORMAT_PNG);
		//open the image file
		$imgbinary = fread(fopen($filename, "r"), filesize($filename));
		//convert it to a base 64 string
		$imgstring = 'data:image/png;base64,' . base64_encode($imgbinary);
		//delete the image file
		unlink($filename);

		return array('personID'=>$personObj['@id'],'barCode'=>$personObj['barCode'],'imgString'=>$imgstring,'action'=>'singleMatch');			

	} else if (count($filteredResults) == 0) {
		//if you don't get any results, then go on to create a new person
		return array('fname'=>$_POST['fname'],'lname'=>$_POST['lname'],'dob'=>$userdob,'action'=>'noMatch');			
	} else {
		//if you have multiples, return back to calling function so it will alert the user
		return array('fname'=>$_POST['fname'],'lname'=>$_POST['lname'],'dob'=>$userdob,'action'=>'multipleMatch');									
	}		
}




?>
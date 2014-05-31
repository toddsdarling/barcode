<?php

require('lib/class/BCGFontFile.php');
require('lib/class/BCGColor.php');
require('lib/class/BCGDrawing.php');
require('lib/class/BCGcode39.barcode.php');


//if they already have a barcode, return the whole person obj back
//return array('personID'=>$personObj['@id'],'barCode'=>$personObj['barCode'],'action'=>'singleMatch');
//generate barcode image and return it
// The arguments are R, G, and B for color.
$colorFront = new BCGColor(0, 0, 0);
$colorBack = new BCGColor(255, 255, 255);
$font = new BCGFontFile('lib/class/font/Arial.ttf', 18);
$code = new BCGcode39(); // Or another class name from the manual
$code->setScale(1); // Resolution			

$code->setOffSetX(5); // Resolution
$code->setOffSetY(5); // Resolution			
$code->setForegroundColor($colorFront); // Color of bars
$code->setBackgroundColor($colorBack); // Color of spaces
$code->setFont($font); // Font (or 0)
$code->parse('1234567890'); // Text

$drawing = new BCGDrawing('', $colorBack);
$drawing->setBarcode($code);
$drawing->setDPI(150);

$drawing->draw();
header('Content-Type: image/png');
$drawing->finish(BCGDrawing::IMG_FORMAT_PNG);
?>
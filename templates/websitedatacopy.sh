#!/bin/bash -e

mkdir websiteData;
cd websiteData;
wget https://$1.s3.amazonaws.com/$2/V2-WEB.zip
unzip V2-WEB.zip
rm -rf V2-WEB.zip
aws s3 sync /websiteData s3://$3


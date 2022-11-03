# AelasticS-Result

2.0.x

> Framework for handling results of software services.

## Getting Started
 
 Installation: `npm install aelastics-result`
 

## Description
 
Service is a coarse-grain functionality implemented by some piece of software (function, object method, API operation, etc.) which can be executed locally or across the network on the Cloud. It can be composed of many other sub-services. 

A result of service, represented by generic `ServiceResult` type, can be either success (`Success` type) or failure (`Failure` type). If it is a success, then the result holds value, an outcome of the service. If it is a failure, then the result holds an array of errors (represented by `ServiceError` type) describing why the service was unsuccessful. 

`ServiceError` is a logical (not actual)<sup>1</sup> subtype of standard Javascript/Typescript `Error` class, extending it by error code property, which classifies the given error.
Failure of some complex service can be cumulative, the consequence of failures of its subordinate services. Type `CumulativeError` represents such situations. `CumulativeError` contains an array of errors which can be atomic `ServiceError` or again `CumulativeError`. Hence,  complex service error scenarios can be completely described through this hierarchy of cumulative and atomic errors.

Standard Javascript/Typescript `Error` objects can be captured (represented by atomic `ServiceError`) and incorporated in this service result handling framework. 

The framework maintains proper stack trace for where errors were thrown<sup>2</sup>. 

<sup>1</sup>`ServiceError` is not actual subtype of standard javascript class Error, i.e. an instance of ServiceError`is not an instance of Error class.

<sup>2</sup> Stack trace feature is not supported by every Javascript engine.

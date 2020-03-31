// https://stackoverflow.com/questions/22885995/how-do-i-initialize-a-typescript-object-with-a-json-object
function deserialize<T>(jsonObject: any, Constructor: { new (): T }): T {
  if (
    !Constructor ||
    !Constructor.prototype.__propertyTypes__ ||
    !jsonObject ||
    typeof jsonObject !== 'object'
  ) {
    // No root-type with usable type-information is available.
    return jsonObject
  }

  // Create an instance of root-type.
  let instance: any = new Constructor()

  // For each property marked with @JsonMember, do...
  Object.keys(Constructor.prototype.__propertyTypes__).forEach(propertyKey => {
    let PropertyType = Constructor.prototype.__propertyTypes__[propertyKey]

    // Deserialize recursively, treat property type as root-type.
    instance[propertyKey] = deserialize(jsonObject[propertyKey], PropertyType)
  })

  return instance
}

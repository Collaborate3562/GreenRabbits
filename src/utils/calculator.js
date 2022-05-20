function innerMatch(asset, condition) {
    let m = true;
    condition.forEach(element => {
        if (m && asset.data[element.key] != element.value) m = false
    });
    return m;
}

function matchCheck(asset, matcher) {
    let m = false;
    matcher.forEach(match => {
        if (!m && innerMatch(asset, match)) m = true
    })
    return m;
}

function getStakingData(asset, config) {
    let staking_data = {};
    config.forEach(data => {
        if (isEmpty(staking_data) && matchCheck(asset, data.matchers))
            staking_data = { weight: data.weight, size: data.size }
    });
    return staking_data;
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }
  
export default getStakingData;
import collections
from datetime import datetime

from datasets import DatasetDict, load_dataset
import numpy as np

datasets = {
    "stars": load_dataset("open-source-metrics/stars").sort('dates'),
    "issues": load_dataset("open-source-metrics/issues").sort('dates'),
    "pip": load_dataset("open-source-metrics/pip").sort('day')
}

val = 0


def _range(e):
    global val
    e['range'] = val
    val += 1

    current_date = datetime.strptime(e['dates'], "%Y-%m-%dT%H:%M:%SZ")
    first_date = datetime.fromtimestamp(1)
    week = abs(current_date - first_date).days // 7
    e['week'] = week

    return e


def _ignore_org_members(e):
    global val
    e['range_non_org'] = val

    if e['type']['authorAssociation'] != 'MEMBER':
        val += 1

    return e

stars = {}
for k, v in datasets['stars'].items():
    stars[k] = v.map(_range)
    val = 0

issues = {}
for k, v in datasets['issues'].items():
    issues[k] = v.map(_range)
    val = 0
    issues[k] = issues[k].map(_ignore_org_members)
    val = 0

datasets['stars'] = DatasetDict(**stars)
datasets['issues'] = DatasetDict(**issues)


def link_values(library_names, returned_values):
    previous_values = {library_name: None for library_name in library_names}
    for library_name in library_names:
        for i in returned_values.keys():
            if library_name not in returned_values[i]:
                returned_values[i][library_name] = previous_values[library_name]
            else:
                previous_values[library_name] = returned_values[i][library_name]

    return returned_values


def running_mean(x, N, total_length=-1):
    cumsum = np.cumsum(np.insert(x, 0, 0))
    to_pad = max(total_length - len(cumsum), 0)
    return np.pad(cumsum[N:] - cumsum[:-N], (to_pad, 0)) / float(N)


def retrieve_pip_installs(library_names, cummulated):

    if cummulated:
        returned_values = {}
        for library_name in library_names:
            for i in datasets['pip'][library_name]:
                if i['day'] in returned_values:
                    returned_values[i['day']]['Cumulated'] += i['num_downloads']
                else:
                    returned_values[i['day']] = {'Cumulated': i['num_downloads']}

        library_names = ['Cumulated']

    else:
        returned_values = {}
        for library_name in library_names:
            for i in datasets['pip'][library_name]:
                if i['day'] in returned_values:
                    returned_values[i['day']][library_name] = i['num_downloads']
                else:
                    returned_values[i['day']] = {library_name: i['num_downloads']}

        for library_name in library_names:
            for i in returned_values.keys():
                if library_name not in returned_values[i]:
                    returned_values[i][library_name] = None

    returned_values = collections.OrderedDict(sorted(returned_values.items()))
    output = {l: [k[l] for k in returned_values.values()] for l in library_names}
    output['day'] = list(returned_values.keys())
    return output


def retrieve_stars(libraries, week_over_week):
    returned_values = {}
    dataset_dict = datasets['stars']

    for library_name in libraries:
        dataset = dataset_dict[library_name]

        last_value = 0
        last_week = dataset[0]['week']
        for i in dataset:
            if week_over_week and last_week == i['week']:
                continue
            if i['dates'] in returned_values:
                returned_values[i['dates']][library_name] = i['range'] - last_value
            else:
                returned_values[i['dates']] = {library_name: i['range'] - last_value}

            last_value = i['range'] if week_over_week else 0
            last_week = i['week']

    returned_values = collections.OrderedDict(sorted(returned_values.items()))
    returned_values = link_values(libraries, returned_values)
    output = {l: [k[l] for k in returned_values.values()][::-1] for l in libraries}
    output['day'] = list(returned_values.keys())[::-1]

    # Trim down to a smaller number of points.
    output = {k: [v for i, v in enumerate(value) if i % int(len(value) / 100) == 0] for k, value in output.items()}
    return output


def retrieve_issues(libraries, exclude_org_members, week_over_week):

    returned_values = {}
    dataset_dict = datasets['issues']
    range_id = 'range' if not exclude_org_members else 'range_non_org'

    for library_name in libraries:
        dataset = dataset_dict[library_name]

        last_value = 0
        last_week = dataset[0]['week']
        for i in dataset:
            if week_over_week and last_week == i['week']:
                continue

            if i['dates'] in returned_values:
                returned_values[i['dates']][library_name] = i[range_id] - last_value
            else:
                returned_values[i['dates']] = {library_name: i[range_id] - last_value}

            last_value = i[range_id] if week_over_week else 0
            last_week = i['week']

    returned_values = collections.OrderedDict(sorted(returned_values.items()))
    returned_values = link_values(libraries, returned_values)
    output = {l: [k[l] for k in returned_values.values()][::-1] for l in libraries}
    output['day'] = list(returned_values.keys())[::-1]

    # Trim down to a smaller number of points.
    output = {
        k: [v for i, v in enumerate(value) if i % int(len(value) / 100) == 0] for k, value in output.items()
    }
    return output
